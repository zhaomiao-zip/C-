#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""C 语言复习工作台：静态文件 + 本地 gcc 编译 API。"""

import http.server
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
import webbrowser

ROOT = os.path.dirname(os.path.abspath(__file__))
HOST = "127.0.0.1"
PORT = 8765
MAX_CODE = 60000
MAX_STDIN = 60000
COMPILE_TIMEOUT = 12
RUN_TIMEOUT = 3


def find_gcc():
    for name in ("gcc", "gcc.exe"):
        p = shutil.which(name)
        if p:
            return p
    candidates = [
        r"E:\coding-vbcoding\MinGW\mingw64\bin\gcc.exe",
        r"C:\mingw64\bin\gcc.exe",
        r"C:\MinGW\bin\gcc.exe",
    ]
    for p in candidates:
        if os.path.isfile(p):
            return p
    return None


GCC = find_gcc()


def decode(data):
    if not data:
        return ""
    for enc in ("utf-8", "gbk", "latin-1"):
        try:
            return data.decode(enc).replace("\r\n", "\n").replace("\r", "\n")
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", "replace").replace("\r\n", "\n").replace("\r", "\n")


def run_c(code, stdin_text):
    if GCC is None:
        return {"stage": "error", "error": "找不到 gcc。请确认 MinGW 已安装并加入 PATH。"}
    if len(code) > MAX_CODE:
        return {"stage": "error", "error": "代码太长。"}
    if len(stdin_text) > MAX_STDIN:
        return {"stage": "error", "error": "输入太长。"}

    tmp = tempfile.mkdtemp(prefix="creview_")
    src = os.path.join(tmp, "main.c")
    exe = os.path.join(tmp, "main.exe" if os.name == "nt" else "main")
    try:
        with open(src, "w", encoding="utf-8", newline="\n") as f:
            f.write(code)

        cmd = [
            GCC, "-std=c99", "-O0", "-Wall", "-Wextra",
            "-finput-charset=UTF-8", "-fexec-charset=UTF-8",
            "-o", exe, src,
        ]
        t0 = time.time()
        try:
            cp = subprocess.run(
                cmd, cwd=tmp, capture_output=True,
                timeout=COMPILE_TIMEOUT,
                creationflags=(subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0),
            )
        except subprocess.TimeoutExpired:
            return {"stage": "compile", "compile": "编译超时（12 秒）。", "ms": COMPILE_TIMEOUT * 1000}

        compile_out = decode(cp.stdout) + decode(cp.stderr)
        if cp.returncode != 0:
            return {
                "stage": "compile",
                "compile": compile_out,
                "ms": int((time.time() - t0) * 1000),
            }

        t1 = time.time()
        try:
            rp = subprocess.run(
                [exe], cwd=tmp,
                input=stdin_text.encode("utf-8"),
                capture_output=True,
                timeout=RUN_TIMEOUT,
                creationflags=(subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0),
            )
            return {
                "stage": "run",
                "compile": compile_out,
                "stdout": decode(rp.stdout),
                "stderr": decode(rp.stderr),
                "exit": rp.returncode,
                "ms": int((time.time() - t1) * 1000),
                "timeout": False,
            }
        except subprocess.TimeoutExpired as e:
            return {
                "stage": "run",
                "compile": compile_out,
                "stdout": decode(e.stdout) if e.stdout else "",
                "stderr": decode(e.stderr) if e.stderr else "",
                "exit": None,
                "ms": RUN_TIMEOUT * 1000,
                "timeout": True,
            }
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args):
        if "/api/" in (self.path or ""):
            sys.stderr.write("[api] " + fmt % args + "\n")

    def do_GET(self):
        if self.path == "/api/health":
            body = json.dumps({
                "ok": GCC is not None,
                "gcc": GCC,
                "platform": sys.platform,
            }, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

    def do_POST(self):
        if self.path != "/api/run":
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_CODE + MAX_STDIN + 4096:
                raise ValueError("bad length")
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            code = payload.get("code", "")
            stdin_text = payload.get("stdin", "")
            if not isinstance(code, str) or not isinstance(stdin_text, str):
                raise ValueError("bad payload")
            result = run_c(code, stdin_text)
        except Exception as e:
            result = {"stage": "error", "error": "请求无效：" + str(e)}

        body = json.dumps(result, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main():
    if GCC is None:
        print("警告：没有找到 gcc，编译功能不可用。")
    else:
        print("gcc: " + GCC)
    print("复习工作台已启动： http://%s:%d" % (HOST, PORT))
    print("按 Ctrl+C 停止。")
    httpd = http.server.ThreadingHTTPServer((HOST, PORT), Handler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止。")
    finally:
        httpd.server_close()


if __name__ == "__main__":
    main()