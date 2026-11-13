/* 知识章节数据：前 10 章标为期中，后 4 章标为期末 */
const CHAPTERS = [
  {
    id: "io", title: "输入输出与格式", term: "mid", minutes: 25,
    summary: "printf / scanf / getchar / 格式符与返回值",
    goals: [
      "记住 8 个高频格式符，能说清 %d、%f、%lf、%c、%s 的区别",
      "知道 scanf 为什么必须传地址，double 为什么必须用 %lf",
      "能控制宽度、精度、左右对齐和补零"
    ],
    sections: [
      {
        h: "printf：格式符决定怎么解释内存",
        html: String.raw`<p><code>printf</code> 不检查参数类型，它只按格式串去读栈上的字节。格式符写错，输出就会变成垃圾值，而且编译器不一定报错。</p>
<table class="tbl"><thead><tr><th>格式符</th><th>含义</th></tr></thead><tbody>
<tr><td><code>%d</code></td><td>十进制整数</td></tr>
<tr><td><code>%f</code></td><td>浮点数，默认 6 位小数</td></tr>
<tr><td><code>%lf</code></td><td>double（scanf 读取时必须用）</td></tr>
<tr><td><code>%c</code></td><td>单个字符</td></tr>
<tr><td><code>%s</code></td><td>字符串</td></tr>
<tr><td><code>%u</code> / <code>%x</code> / <code>%o</code></td><td>无符号 / 十六进制 / 八进制</td></tr>
<tr><td><code>%%</code></td><td>输出一个百分号</td></tr>
</tbody></table>
<p>宽度和精度写在格式符中间：<code>%5d</code> 右对齐占 5 格，<code>%-5d</code> 左对齐，<code>%05d</code> 补零，<code>%.2f</code> 保留两位小数，<code>%8.2f</code> 总宽 8 位、两位小数。</p>`,
        code: String.raw`printf("%5d", 10);     /* "   10" */
printf("%-5d", 10);    /* "10   " */
printf("%05d", 10);    /* "00010" */
printf("%.2f", 3.1415);/* "3.14" */
printf("%8.2f", 3.1415);/* "    3.14" */`
      },
      {
        h: "scanf：除了字符串，都要取地址",
        html: String.raw`<p><code>scanf</code> 要把读到的值写回变量，所以必须知道变量在哪里。普通变量传 <code>&amp;变量</code>；字符数组名本身就是地址，不用加 <code>&amp;</code>。</p>
<p><code>double</code> 的读取格式是 <code>%lf</code>，输出可以用 <code>%f</code>。这是 C 里少数「读写格式不一样」的地方。</p>`,
        code: String.raw`int n;
scanf("%d", &n);          /* 必须 & */

double x;
scanf("%lf", &x);         /* double 用 %lf 读 */

char name[20];
scanf("%19s", name);      /* 数组名不加 &，19 留位置给 '\0' */

char ch;
scanf(" %c", &ch);        /* 前面的空格跳过换行和空白 */`
      },
      {
        h: "getchar / putchar：按字符处理",
        html: String.raw`<p><code>getchar()</code> 返回 <code>int</code>，不是 <code>char</code>。因为要用 <code>EOF</code>（通常是 -1）表示「读完了」，<code>char</code> 装不下这个额外状态。</p>
<p>读字符时要小心输入缓冲区里的换行符。上一个 <code>scanf</code> 留下的 <code>'\n'</code> 会被下一个 <code>%c</code> 读走，所以常写 <code>scanf(" %c", &amp;ch)</code>。</p>`,
        code: String.raw`int c;
while ((c = getchar()) != EOF) {
    putchar(c);
}`
      }
    ],
    traps: [
      "读 double 用 %f：值会错，甚至破坏相邻内存",
      "scanf(\"%d\", n) 少写 &：程序很可能直接崩溃",
      "输出「请输入 n：」这类提示语：判题系统只比对输出，提示语算错",
      "%c 读到上一行留下的换行：写成 \" %c\""
    ]
  },

  {
    id: "types", title: "数据类型与进制", term: "mid", minutes: 30,
    summary: "字节数 / 进制常量 / 补码 / ASCII",
    goals: [
      "记住 int、short、long、char、float、double 的常见字节数",
      "会读写十进制、八进制、十六进制、二进制常量",
      "理解补码，能说出 -5 在 8 位下的补码",
      "记住 'A'、'a'、'0' 的 ASCII 值"
    ],
    sections: [
      {
        h: "类型与字节数",
        html: String.raw`<table class="tbl"><thead><tr><th>类型</th><th>常见字节</th><th>格式符</th><th>范围</th></tr></thead><tbody>
<tr><td><code>int</code></td><td>4</td><td><code>%d</code></td><td>-2,147,483,648 ~ 2,147,483,647</td></tr>
<tr><td><code>short</code></td><td>2</td><td><code>%hd</code></td><td>-32,768 ~ 32,767</td></tr>
<tr><td><code>long</code></td><td>4 或 8</td><td><code>%ld</code></td><td>平台相关</td></tr>
<tr><td><code>char</code></td><td>1</td><td><code>%c</code> / <code>%d</code></td><td>-128 ~ 127</td></tr>
<tr><td><code>float</code></td><td>4</td><td><code>%f</code></td><td>约 6–7 位有效数字</td></tr>
<tr><td><code>double</code></td><td>8</td><td><code>%lf</code> / <code>%f</code></td><td>约 15–16 位有效数字</td></tr>
</tbody></table>
<p>字节数不是标准保证的，但课程平台按上表。考试若没特别说明，就按 4 字节 int、8 字节 double。</p>`
      },
      {
        h: "进制常量与后缀",
        html: String.raw`<p>同一个数有多种写法：</p>
<ul class="list">
<li><code>65</code>：十进制</li>
<li><code>0101</code>：以 0 开头，八进制，等于 65</li>
<li><code>0x41</code>：以 0x 开头，十六进制，等于 65</li>
<li><code>0b1000001</code>：以 0b 开头，二进制，C99 起支持</li>
</ul>
<p>后缀用来指定类型：<code>123U</code> 无符号，<code>123L</code> 长整型，<code>123LL</code> 长长整型，<code>123ULL</code> 无符号长长整型。</p>`,
        code: String.raw`int a = 0101;    /* 八进制 101 = 65 */
int b = 0x41;    /* 十六进制 41 = 65 */
int c = 65;      /* 十进制 65 */
/* 三者值完全相同 */`
      },
      {
        h: "原码、反码、补码",
        html: String.raw`<p>现代计算机用补码存有符号整数。以 8 位为例：</p>
<ul class="list">
<li>原码：最高位符号位，0 正 1 负，其余是绝对值</li>
<li>反码：正数同原码；负数符号位不变，其余取反</li>
<li>补码：正数同原码；负数 = 反码 + 1</li>
</ul>
<p><code>+5</code> 的补码是 <code>00000101</code>；<code>-5</code> 的原码 <code>10000101</code>，反码 <code>11111010</code>，补码 <code>11111011</code>。</p>
<p>补码的好处：减法可以变成加法，0 只有一种表示，范围比原码多一个负数。</p>`
      },
      {
        h: "char 与 ASCII",
        html: String.raw`<p><code>char</code> 本质是 1 字节整数。字符 <code>'A'</code> 存的是 65，<code>'a'</code> 是 97，<code>'0'</code> 是 48。</p>
<p>常用规律：大写字母 + 32 = 对应小写字母；<code>'0'</code> 到 <code>'9'</code> 连续；<code>'A'</code> 到 <code>'Z'</code> 连续。</p>`,
        code: String.raw`char c = 'A';
printf("%c %d", c, c);   /* A 65 */
printf("%c", c + 32);    /* a */`
      }
    ],
    traps: [
      "sizeof('A') 在 C 里是 4，不是 1（字符常量类型是 int）",
      "sizeof(\"A\") 是 2，字符串末尾有 '\\0'",
      "'\\101' 是八进制转义，等于 65；'\\x41' 是十六进制转义，也等于 65",
      "'\\08' 不是合法单字符：\\0 是转义，8 是另一个字符，属多字符常量"
    ]
  },

  {
    id: "vars", title: "变量、作用域与 static", term: "mid", minutes: 25,
    summary: "命名 / 生命周期 / 遮蔽 / 静态变量",
    goals: [
      "能判断一个变量在哪些位置可见",
      "分清局部变量、全局变量、静态局部变量的生命周期",
      "理解同名遮蔽，知道为什么 swap 改不了实参"
    ],
    sections: [
      {
        h: "命名规则",
        html: String.raw`<ul class="list">
<li>只能由字母、数字、下划线组成</li>
<li>不能以数字开头</li>
<li>不能是关键字（<code>int</code>、<code>for</code>、<code>return</code> 等 32 个）</li>
<li>区分大小写：<code>Age</code> 和 <code>age</code> 是两个变量</li>
</ul>
<p><code>main</code>、<code>printf</code>、<code>define</code> 都不是关键字，可以作为标识符（但不建议）。</p>`
      },
      {
        h: "作用域与生命周期",
        html: String.raw`<table class="tbl"><thead><tr><th>变量</th><th>作用域</th><th>生命周期</th><th>初值</th></tr></thead><tbody>
<tr><td>局部变量</td><td>所在代码块</td><td>函数调用期间</td><td><strong>不确定（垃圾值）</strong></td></tr>
<tr><td>全局变量</td><td>整个文件</td><td>整个程序</td><td>自动为 0</td></tr>
<tr><td>静态局部变量</td><td>所在代码块</td><td>整个程序</td><td>自动为 0，只初始化一次</td></tr>
</tbody></table>
<p>局部变量不初始化就直接用，是未定义行为。考试常拿「输出一个随机数」来考这一点。</p>`,
        code: String.raw`void f(void) {
    static int count = 0;   /* 只初始化一次 */
    count++;
    printf("%d ", count);
}
/* 调用三次输出：1 2 3 */`
      },
      {
        h: "同名遮蔽（shadowing）",
        html: String.raw`<p>内层作用域可以定义和外层同名的变量，内层会「遮住」外层。它们<strong>不是同一个变量</strong>，各有各的内存。</p>
<p>这就是上一题 <code>swap</code> 输出 <code>3,8</code> 的原因之一：全局有一对 <code>x,y</code>，<code>main</code> 里有一对，<code>swap</code> 形参又是一对。三层同名，互不影响。</p>`,
        code: String.raw`int x = 5;
int main(void) {
    int x = 3;        /* 遮蔽全局 x */
    printf("%d", x);  /* 3 */
    return 0;
}`
      }
    ],
    traps: [
      "以为同名就是同一个变量：作用域不同，内存不同",
      "局部数组/变量未初始化就用：值是垃圾",
      "以为 static 局部变量每次调用都重置：它只初始化一次",
      "在函数里定义和全局同名的变量，误以为改的是全局"
    ]
  },

  {
    id: "expr", title: "运算符与表达式", term: "mid", minutes: 40,
    summary: "整数除法 / 优先级 / 短路 / 自增 / 复合赋值",
    goals: [
      "算对整数除法、取余、类型转换",
      "记住优先级表和结合方向，拿不准会加括号",
      "理解 && 与 || 的短路求值",
      "分清 a++ 和 ++a，理解复合赋值的展开"
    ],
    sections: [
      {
        h: "整数除法与取余",
        html: String.raw`<p>两个 <code>int</code> 相除，结果还是 <code>int</code>，小数部分直接截断，不是四舍五入。</p>
<p><code>10 / 4</code> 是 <code>2</code>；<code>10.0 / 4</code> 才是 <code>2.5</code>。赋值目标的类型不会反过来改变已经算完的除法：<code>float x = 10 / 4;</code> 得到的是 <code>2.0</code>。</p>
<p>取余 <code>%</code> 只能用于整数。C 里负数取余的符号跟随被除数：<code>-7 % 3</code> 是 <code>-1</code>。</p>`,
        code: String.raw`float x = 10 / 4;        /* 2.0，不是 2.5 */
float y = 10.0 / 4;      /* 2.5 */
float z = (float)10 / 4; /* 2.5 */`
      },
      {
        h: "关系运算与连比陷阱",
        html: String.raw`<p>C 没有数学上的「连比」。关系运算符左结合，所以：</p>
<p><code>4 &gt; 3 &gt; 2</code> 实际是 <code>(4 &gt; 3) &gt; 2</code>，即 <code>1 &gt; 2</code>，结果是 <strong>0</strong>。</p>
<p>判断区间必须用 <code>&amp;&amp;</code>：<code>0 &lt;= i &amp;&amp; i &lt; n</code>。写成 <code>0 &lt;= i &lt; n</code> 时，n=2、i=100 会得到 <code>(0&lt;=100) &lt; 2</code>，即 <code>1 &lt; 2</code>，误判为真。</p>`
      },
      {
        h: "逻辑运算与短路",
        html: String.raw`<p><code>&amp;&amp;</code> 左边为假时，右边不执行；<code>||</code> 左边为真时，右边不执行。这不只是效率问题，还影响副作用。</p>
<p><code>if (i != 0 &amp;&amp; 10 / i &gt; 1)</code> 是安全的：i 为 0 时右边不执行，不会除零。把顺序反过来就会崩溃。</p>`,
        code: String.raw`int i = 0;
if (i != 0 && 10 / i > 1) { /* 不会进来，也不会除零 */ }
if (i == 0 || 10 / i > 1) { /* 左边为真，右边不执行 */ }`
      },
      {
        h: "自增自减与复合赋值",
        html: String.raw`<p><code>a++</code> 先用后加，<code>++a</code> 先加后用。不要在同一个表达式里对同一个变量多次自增，那是未定义行为。</p>
<p>复合赋值 <code>E1 op= E2</code> 等价于 <code>E1 = E1 op (E2)</code>，括号很重要：</p>
<ul class="list">
<li><code>x *= y + z</code> → <code>x = x * (y + z)</code></li>
<li><code>x -= y - z</code> → <code>x = x - (y - z)</code></li>
<li><code>x /= y * z</code> → <code>x = x / (y * z)</code></li>
</ul>`
      },
      {
        h: "优先级速查",
        html: String.raw`<p>从高到低：后缀 → 单目 → 乘除余 → 加减 → 移位 → 关系 → 相等 → 按位与/异或/或 → 逻辑与/或 → 条件 → 赋值 → 逗号。</p>
<p>两个容易错的点：<code>==</code> 的优先级高于 <code>&amp;</code>，所以 <code>a &amp; b == c</code> 是 <code>a &amp; (b == c)</code>；赋值是右结合，<code>a = b = 3</code> 先算 <code>b = 3</code>。</p>`
      }
    ],
    traps: [
      "10 / 4 以为等于 2.5：整数除法先截断",
      "4 > 3 > 2 以为等于 1：实际是 (4>3)>2 = 0",
      "-1 <= i < 1 以为是区间判断：实际是 (-1<=i)<1",
      "x *= y + z 以为等于 x*y+z：实际是 x*(y+z)",
      "i++ + i++ 是未定义行为，不同编译器结果不同",
      "用 == 比较浮点数：应写 fabs(a-b) < 1e-9"
    ]
  },

  {
    id: "branch", title: "分支结构", term: "mid", minutes: 25,
    summary: "if / else if / else 配对 / switch 穿透",
    goals: [
      "能写三种 if 结构，知道 else 和谁配对",
      "理解 switch 的 case 穿透与 default 位置",
      "避开 if (a = 0) 这类赋值/比较混淆"
    ],
    sections: [
      {
        h: "if 的三种形态",
        html: String.raw`<p>单分支 <code>if</code>、双分支 <code>if-else</code>、多分支 <code>if-else if-else</code>。多分支从上到下检查，执行第一个为真的分支，后面的不再判断。</p>
<p>条件的顺序很重要。判断成绩等级时，要先判 <code>&gt;= 90</code>，再判 <code>&gt;= 80</code>；反过来写，90 分也会落进 80 的区间。</p>`,
        code: String.raw`if (score >= 90)      grade = 'A';
else if (score >= 80) grade = 'B';
else if (score >= 60) grade = 'C';
else                  grade = 'D';`
      },
      {
        h: "else 的配对规则",
        html: String.raw`<p><code>else</code> 总是和<strong>最近的、尚未配对的</strong> <code>if</code> 配对，和缩进无关。</p>
<p>下面这段，<code>else</code> 属于内层 <code>if (b &gt; 0)</code>，不是外层。想让它属于外层，必须加花括号。</p>`,
        code: String.raw`if (a > 0)
    if (b > 0) printf("both");
    else       printf("a>0 but b<=0");  /* 属于内层 if */

/* 想让 else 属于外层： */
if (a > 0) {
    if (b > 0) printf("both");
} else {
    printf("a<=0");
}`
      },
      {
        h: "switch：等值多分支",
        html: String.raw`<p><code>switch</code> 的表达式必须是整型或字符型，不能是浮点、字符串。每个 <code>case</code> 后面通常要 <code>break</code>，否则会「穿透」到下一个 case。</p>
<p><code>default</code> 可以放在任意位置，但总在所有 case 都不匹配时执行。多个 case 共用一段代码时，故意不写 break 是合法技巧。</p>`,
        code: String.raw`switch (ch) {
case 'a':
case 'e':
case 'i':
case 'o':
case 'u':
    printf("元音");
    break;
default:
    printf("辅音");
}`
      }
    ],
    traps: [
      "if (a = 0) 是赋值，条件永远为假；应写 a == 0",
      "else 配对最近的 if，缩进骗人",
      "switch 忘记 break，case 穿透",
      "switch 的表达式用了浮点或字符串",
      "多分支条件顺序反了，宽条件写在前面"
    ]
  },

  {
    id: "loop", title: "循环结构", term: "mid", minutes: 40,
    summary: "for / while / do-while / break / continue / 手算",
    goals: [
      "能根据场景选对循环，知道三种循环的执行顺序",
      "说清 continue 在三种循环里分别跳到哪里",
      "能用三列表手算循环，不靠猜"
    ],
    sections: [
      {
        h: "三种循环",
        html: String.raw`<table class="tbl"><thead><tr><th>循环</th><th>特点</th><th>什么时候用</th></tr></thead><tbody>
<tr><td><code>for</code></td><td>初始化、条件、更新写在一行</td><td>次数已知，或标准遍历</td></tr>
<tr><td><code>while</code></td><td>先判断再执行，可能一次都不执行</td><td>次数未知，靠条件停</td></tr>
<tr><td><code>do-while</code></td><td>先执行再判断，<strong>至少执行一次</strong></td><td>至少要读一次 / 做一次</td></tr>
</tbody></table>
<p><code>for</code> 的三个表达式都可以省略：<code>for (;;)</code> 是死循环。但省略循环条件时要自己保证能退出。</p>`
      },
      {
        h: "break 与 continue 的去向",
        html: String.raw`<p><code>break</code> 跳出整个循环；<code>continue</code> 跳过本轮剩下的语句，进入下一轮。</p>
<table class="tbl"><thead><tr><th>循环</th><th>continue 跳到</th></tr></thead><tbody>
<tr><td><code>while</code></td><td>条件判断</td></tr>
<tr><td><code>for</code></td><td><strong>更新表达式</strong>（i++ 那一格）</td></tr>
<tr><td><code>do-while</code></td><td><strong>底部条件判断</strong></td></tr>
</tbody></table>
<p>所以在 <code>do-while</code> 里写 <code>continue</code>，条件里的 <code>--i</code> 仍会执行；在 <code>while</code> 里如果跳过了更新，就会死循环。</p>`
      },
      {
        h: "手算的标准做法",
        html: String.raw`<p>不要在心里默算。画三列表：</p>
<table class="tbl"><thead><tr><th>轮次</th><th>进入时状态</th><th>本轮做了什么</th><th>离开时状态</th></tr></thead><tbody>
<tr><td>1</td><td>i=5</td><td>奇数，continue</td><td>--i → 4</td></tr>
<tr><td>2</td><td>i=4</td><td>s += 4 → 4</td><td>--i → 3</td></tr>
</tbody></table>
<p>变量多于三个时，只记会变的那些。</p>`
      },
      {
        h: "四个常用模式",
        html: String.raw`<ul class="list">
<li><strong>数位拆分</strong>：<code>sum += n % 10; n /= 10;</code></li>
<li><strong>素数判断</strong>：<code>for (d = 2; d &lt;= x / d; d++)</code></li>
<li><strong>辗转相除</strong>：<code>while (b) { r = a % b; a = b; b = r; }</code></li>
<li><strong>穷举</strong>：百钱百鸡用 <code>z = 100 - x - y</code> 少一层循环</li>
</ul>`,
        code: String.raw`int n = 1234, sum = 0;
while (n != 0) {
    sum += n % 10;   /* 取末位 */
    n /= 10;         /* 去掉末位 */
}
printf("%d", sum);   /* 10 */`
      }
    ],
    traps: [
      "for 后面多写一个分号，循环体变成空语句",
      "continue 跳过了循环变量的更新，造成死循环",
      "do-while 的 continue 会走到条件，和 while 不同",
      "边界写成 i <= n，数组越界",
      "循环变量忘了更新，或更新方向反了",
      "while (n) 里 n 不变，死循环"
    ]
  },

  {
    id: "array", title: "数组", term: "mid", minutes: 45,
    summary: "一维 / 二维 / 下标 / 初始化 / 插入删除 / sizeof",
    goals: [
      "正确声明和初始化一维、二维数组",
      "记住下标范围，能一眼看出越界",
      "会写最值、逆序、插入、删除、左移、矩阵遍历",
      "说清 sizeof(数组) 和 sizeof(指针) 的区别"
    ],
    sections: [
      {
        h: "声明与初始化",
        html: String.raw`<pre class="inline-code">int a[5];              /* 5 个元素，局部数组未初始化，值是垃圾 */
int b[5] = {1, 2};     /* 前两个 1、2，其余自动补 0 */
int c[] = {1, 2, 3};   /* 长度由初始化列表决定，是 3 */
int d[5] = {0};        /* 全部清零的常用写法 */</pre>
<p>二维数组<strong>列数不能省</strong>，行数可以省：</p>
<pre class="inline-code">int e[][4] = {{1,2,3,4}, {5,6,7,8}};  /* 合法，2 行 4 列 */
int f[2][] = {{1,2,3,4}};             /* 非法，列数缺失 */</pre>
<p>原因：编译器要算 <code>a[i][j]</code> 的地址，必须知道一行有多长；行数不影响元素地址计算，可以由初始化列表数出来。</p>`
      },
      {
        h: "下标与越界",
        html: String.raw`<p>长度为 <code>n</code> 的数组，合法下标是 <code>0</code> 到 <code>n-1</code>。最后一个元素是 <code>a[n-1]</code>，不是 <code>a[n]</code>。</p>
<p>C <strong>不检查越界</strong>。越界可能不报错、可能改掉别的变量、可能崩溃，属于未定义行为。「能跑」不等于「正确」。</p>`
      },
      {
        h: "一维数组的五个模板",
        html: String.raw`<ul class="list">
<li>最值：<code>best = 0; for (i=1;i&lt;n;i++) if (a[i]&lt;a[best]) best=i;</code></li>
<li>逆序：双指针 <code>i=0, j=n-1</code> 向中间交换</li>
<li>插入：从后往前挪，给新元素让位</li>
<li>删除：从前往后挪，把后面的元素补上来</li>
<li>循环左移：三次翻转，O(n) 且不用额外数组</li>
</ul>`,
        code: String.raw`void reverse(int a[], int l, int r) {
    while (l < r) {
        int t = a[l]; a[l] = a[r]; a[r] = t;
        l++; r--;
    }
}
void left_shift(int a[], int n, int m) {
    m %= n;
    reverse(a, 0, m - 1);
    reverse(a, m, n - 1);
    reverse(a, 0, n - 1);
}`
      },
      {
        h: "二维数组与鞍点",
        html: String.raw`<p>二维数组就是「元素类型为一维数组」的数组。遍历时外层行、内层列。</p>
<p>鞍点：该位置是本行最大、本列最小。n ≤ 6 时，直接枚举每个位置并检查整行整列，O(n³) 足够，逻辑最清楚。</p>`,
        code: String.raw`for (int i = 0; i < n; i++)
  for (int j = 0; j < n; j++) {
      int rowMax = 1, colMin = 1;
      for (int k = 0; k < n; k++) {
          if (a[i][k] > a[i][j]) rowMax = 0;
          if (a[k][j] < a[i][j]) colMin = 0;
      }
      if (rowMax && colMin) { printf("%d %d", i, j); return 0; }
  }
printf("NONE");`
      },
      {
        h: "sizeof 与数组退化",
        html: String.raw`<p>数组名在三种情况下<strong>不</strong>退化成指针：作为 <code>sizeof</code> 的操作数、作为 <code>&amp;</code> 的操作数、用字符串字面量初始化字符数组。其他场合（参与加减、传参）都会退化。</p>
<p><code>sizeof(a)</code> 是数组总字节数；<code>sizeof(a[0])</code> 是单个元素大小；两者相除就是元素个数。<strong>但数组传进函数后就退化成指针，这个公式失效。</strong></p>`,
        code: String.raw`int a[10];
sizeof(a)        /* 40 */
sizeof(a[0])     /* 4  */
sizeof(a)/sizeof(a[0])  /* 10 */

void f(int a[10]) {
    sizeof(a);   /* 8（64 位指针），不是 40 */
}`
      }
    ],
    traps: [
      "访问 a[n]：最后一个合法下标是 n-1",
      "二维数组省略列数：int a[2][] 非法",
      "以为 int a[5]; 自动为 0：局部数组是垃圾值",
      "在函数里用 sizeof(a)/sizeof(a[0]) 求长度：数组已退化成指针",
      "插入时从前往后挪，覆盖尚未读取的数据",
      "删除时循环边界写成 i < n，越界"
    ]
  },

  {
    id: "func", title: "函数", term: "mid", minutes: 35,
    summary: "声明 / 定义 / 值传递 / 数组参数 / 返回路径",
    goals: [
      "分清声明与定义，能判断编译错误还是链接错误",
      "理解值传递，知道为什么函数内交换不了实参",
      "会写数组参数，知道长度必须单独传",
      "保证每条路径都有返回值"
    ],
    sections: [
      {
        h: "声明、定义与调用",
        html: String.raw`<p>声明告诉编译器「有这个函数」，以分号结尾；定义是真正的实现。定义写在调用之后时，必须在调用前声明。</p>
<table class="tbl"><thead><tr><th>报错</th><th>阶段</th><th>常见原因</th></tr></thead><tbody>
<tr><td><code>implicit declaration</code></td><td>编译</td><td>没声明，或函数名拼错</td></tr>
<tr><td><code>undefined reference</code></td><td>链接</td><td>声明了但没定义，或名字不一致</td></tr>
</tbody></table>`
      },
      {
        h: "值传递：形参是副本",
        html: String.raw`<p>C 只有值传递。调用时实参的值被复制给形参，形参是函数内的局部变量，改它不影响实参。</p>
<p>所以下面这个 <code>swap</code> 交换不了。想真正交换必须传地址（指针），下半学期才学。</p>`,
        code: String.raw`void swap(int a, int b) {
    int t = a; a = b; b = t;   /* 只交换副本 */
}
int main(void) {
    int x = 1, y = 2;
    swap(x, y);                /* x 仍是 1，y 仍是 2 */
}`
      },
      {
        h: "数组参数",
        html: String.raw`<p>数组名作参数时，传的是首地址，函数内改 <code>a[i]</code> 会改到原数组。但长度不会自动传，必须额外加一个 <code>int n</code>。</p>
<p>函数里的 <code>a</code> 已经是指针，<code>sizeof(a)</code> 得到的是指针大小，不是数组总字节数。</p>`,
        code: String.raw`void add_one(int a[], int n) {
    for (int i = 0; i < n; i++) a[i]++;
}`
      },
      {
        h: "返回路径要完整",
        html: String.raw`<p>非 <code>void</code> 函数，每条执行路径都必须 <code>return</code> 一个和返回类型匹配的值。<code>void</code> 函数只能 <code>return;</code> 或不写 return。</p>
<p>函数题通常只提交指定函数，不要写 <code>main</code>，接口的类型、个数、顺序必须和题目逐字一致。</p>`,
        code: String.raw`int sign(int x) {
    if (x > 0) return 1;
    if (x < 0) return -1;
    return 0;              /* 这条不能漏 */
}

void f(void) { return; }   /* 合法 */
void g(void) { return 0; } /* 非法：void 函数不能返回值 */`
      }
    ],
    traps: [
      "函数题多写了 main 或 #include",
      "参数类型/个数/顺序和接口不一致",
      "void 函数里 return 一个值",
      "非 void 函数某条路径没有 return",
      "以为函数里改 int 形参，实参会变",
      "数组参数只传数组名，不传长度"
    ]
  },

  {
    id: "recur", title: "递归", term: "mid", minutes: 40,
    summary: "终止条件 / 规模变小 / 调用栈 / 先序后序 / 汉诺塔",
    goals: [
      "写递归前能写出「含义 / 递推 / 终止」三行",
      "理解调用栈，知道返回后还剩什么运算",
      "能闭卷写出阶乘、汉诺塔、递归二分",
      "分清先序输出和后序输出"
    ],
    sections: [
      {
        h: "写递归前先写三行",
        html: String.raw`<pre class="inline-code">f(n) 的含义：n!
递推关系：  f(n) = n * f(n - 1)
终止条件：  f(0) = 1</pre>
<p>三行写不出来，代码一定写不对。写完之后用「信任递归」检查：假设 <code>f(n-1)</code> 已经正确，看 <code>f(n)</code> 能不能得到正确答案。</p>`
      },
      {
        h: "调用栈与返回后的运算",
        html: String.raw`<p><code>factorial(4)</code> 会一路压栈到 <code>factorial(0)</code>，再一路返回。每个 <code>*</code> 都是在「回来以后」才执行的，所以每一层的 <code>n</code> 都必须保留。</p>
<pre class="inline-code">factorial(4)
  → 4 * factorial(3)
        → 3 * factorial(2)
              → 2 * factorial(1)
                    → 1 * factorial(0)
                          → 返回 1
                    ← 返回 1
              ← 返回 2
        ← 返回 6
  ← 返回 24</pre>`,
        code: String.raw`long long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}`
      },
      {
        h: "汉诺塔：参数顺序是最大陷阱",
        html: String.raw`<p>把「n 个盘从 from 搬到 to」拆成三步：先把 n-1 个搬到 via，再搬最大盘，最后把 n-1 个搬到 to。</p>
<p>题目输入是「盘数 起始柱 目标柱 过渡柱」，所以函数参数应是 <code>(n, from, to, via)</code>。第三个是目标，第四个是过渡，写反输出全错。</p>`,
        code: String.raw`void hanoi(int n, char from, char to, char via) {
    if (n == 1) {
        printf("%d: %c -> %c\n", n, from, to);
        return;
    }
    hanoi(n - 1, from, via, to);            /* 借助 to 搬到 via */
    printf("%d: %c -> %c\n", n, from, to);  /* 最大盘 */
    hanoi(n - 1, via, to, from);            /* 借助 from 搬到 to */
}`
      },
      {
        h: "输出位置决定顺序",
        html: String.raw`<p>输出语句放在递归调用<strong>前</strong>，是正序；放在调用<strong>后</strong>，是逆序。因为最内层最先返回。</p>
<pre class="inline-code">void print_forward(int a[], int i, int n) {
    if (i == n) return;
    printf("%d ", a[i]);
    print_forward(a, i + 1, n);
}

void print_backward(int a[], int i, int n) {
    if (i == n) return;
    print_backward(a, i + 1, n);
    printf("%d ", a[i]);
}</pre>`
      }
    ],
    traps: [
      "没有终止条件，或参数没有向终止条件靠近",
      "写了 f(n-1); 但没 return 或没接返回值",
      "汉诺塔的 from / to / via 顺序写反",
      "输出语句位置放错，正序变逆序",
      "用全局变量累加，多次调用之间没清零",
      "递归深度过大导致栈溢出"
    ]
  },

  {
    id: "sort", title: "排序", term: "mid", minutes: 35,
    summary: "复杂度 / 稳定性 / 冒泡 / 选择 / 插入 / 快排 / 归并",
    goals: [
      "背下五种排序的复杂度、空间和稳定性",
      "会手算冒泡的一趟",
      "能写出插入、快排 partition、归并 merge",
      "知道快排最坏 O(n²) 的条件"
    ],
    sections: [
      {
        h: "总表",
        html: String.raw`<table class="tbl"><thead><tr><th>算法</th><th>平均</th><th>最好</th><th>最坏</th><th>空间</th><th>稳定</th></tr></thead><tbody>
<tr><td>冒泡</td><td>O(n²)</td><td>O(n)</td><td>O(n²)</td><td>O(1)</td><td>稳定</td></tr>
<tr><td>选择</td><td>O(n²)</td><td>O(n²)</td><td>O(n²)</td><td>O(1)</td><td>不稳定</td></tr>
<tr><td>插入</td><td>O(n²)</td><td>O(n)</td><td>O(n²)</td><td>O(1)</td><td>稳定</td></tr>
<tr><td>归并</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n)</td><td>稳定</td></tr>
<tr><td>快排</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n²)</td><td>O(log n)</td><td>不稳定</td></tr>
</tbody></table>
<p>比较排序的最坏下界是 Ω(n log n)；计数/基数/桶排序不是比较排序，可以到 O(n)，但不可能低于 O(n)。</p>`
      },
      {
        h: "冒泡的一趟",
        html: String.raw`<p>从左到右比较相邻元素，前者大就交换。走完一趟，最大值一定被换到末尾。</p>
<p><code>{3, 50, 27, 46, 44, 20}</code> 一趟后是 <code>{3, 27, 46, 44, 20, 50}</code>。</p>`,
        code: String.raw`void bubble_sort(int a[], int n) {
    for (int i = n - 1; i >= 1; i--)
        for (int j = 0; j < i; j++)
            if (a[j] > a[j + 1]) {
                int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
            }
}`
      },
      {
        h: "插入排序：和「有序数组插入」是同一件事",
        html: String.raw`<p>把 <code>a[0..i-1]</code> 看成已排序区间，把 <code>a[i]</code> 插进去。数据近乎有序时，while 很少执行，最好 O(n)。</p>
<p><code>while (j &gt;= 0 &amp;&amp; a[j] &gt; key)</code> 的顺序不能反，否则 j = -1 时会访问 <code>a[-1]</code>。</p>`,
        code: String.raw`void insertion_sort(int a[], int n) {
    for (int i = 1; i < n; i++) {
        int key = a[i], j = i - 1;
        while (j >= 0 && a[j] > key) {
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = key;
    }
}`
      },
      {
        h: "快排与归并",
        html: String.raw`<p>快排：选 pivot，划分成左右两段，递归排序。<code>partition</code> 返回 <code>j</code>，不是 <code>i</code>。已排序数组 + 固定取首元素作 pivot 会退化为 O(n²)。</p>
<p>归并：分成两半，递归排序，再合并。合并时用 <code>&lt;=</code> 才能保持稳定。需要 O(n) 临时数组。</p>`,
        code: String.raw`int partition(int a[], int l, int r) {
    int pivot = a[l], i = l - 1, j = r + 1;
    while (1) {
        do { i++; } while (a[i] < pivot);
        do { j--; } while (a[j] > pivot);
        if (i >= j) return j;
        int t = a[i]; a[i] = a[j]; a[j] = t;
    }
}

void merge(int a[], int l, int m, int r, int tmp[]) {
    int i = l, j = m + 1, k = l;
    while (i <= m && j <= r)
        tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];
    while (i <= m) tmp[k++] = a[i++];
    while (j <= r) tmp[k++] = a[j++];
    for (i = l; i <= r; i++) a[i] = tmp[i];
}`
      }
    ],
    traps: [
      "冒泡内层写成 j < n-1，多做了无用比较",
      "选择排序以为稳定：反例 {2a, 2b, 1}",
      "插入排序 while 条件顺序反了，越界",
      "归并 merge 用 < 而不是 <=，破坏稳定性",
      "快排 partition 返回 i 而不是 j，递归死循环",
      "以为快排最坏是 O(n log n)"
    ]
  },

  {
    id: "ptr", title: "指针", term: "final", minutes: 40,
    summary: "地址 / 解引用 / 指针与数组 / 指针参数",
    goals: [
      "理解指针存的是地址，& 取地址，* 解引用",
      "知道指针加 1 移动多少字节",
      "能用指针参数修改调用者的变量"
    ],
    sections: [
      {
        h: "指针是什么",
        html: String.raw`<p>指针是一个变量，它的值是另一个变量的内存地址。声明 <code>int *p;</code>，<code>&amp;a</code> 取 a 的地址，<code>*p</code> 访问 p 指向的值。</p>
<p>指针也有类型：<code>int *</code> 加 1 前进 4 字节，<code>char *</code> 加 1 前进 1 字节，<code>double *</code> 加 1 前进 8 字节。</p>`,
        code: String.raw`int a = 10;
int *p = &a;
printf("%d", *p);   /* 10 */
*p = 20;            /* a 变成 20 */`
      },
      {
        h: "指针与数组",
        html: String.raw`<p>数组名在大多数表达式里会退化成指向首元素的指针，所以 <code>a[i]</code> 等价于 <code>*(a + i)</code>。</p>
<p>但 <code>sizeof(a)</code> 和 <code>&amp;a</code> 是例外：前者得到数组总字节数，后者得到「指向整个数组的指针」。</p>`
      },
      {
        h: "指针参数：真正交换",
        html: String.raw`<p>传地址才能在函数里修改调用者的变量。这是 C 实现「引用传递效果」的唯一方式。</p>`,
        code: String.raw`void swap(int *a, int *b) {
    int t = *a; *a = *b; *b = t;
}
int main(void) {
    int x = 1, y = 2;
    swap(&x, &y);   /* x=2, y=1 */
}`
      }
    ],
    traps: [
      "野指针：未初始化就解引用",
      "返回局部变量的地址：函数结束后内存已失效",
      "混淆 *p++ 和 (*p)++",
      "指针类型不匹配，加减 1 的步长错"
    ]
  },

  {
    id: "str", title: "字符串", term: "final", minutes: 35,
    summary: "字符数组 / '\\0' / string.h / 字符指针",
    goals: [
      "知道字符串以 '\\0' 结尾",
      "会用 strlen、strcpy、strcmp、strcat",
      "分清字符数组和字符指针"
    ],
    sections: [
      {
        h: "字符数组与结束标志",
        html: String.raw`<p>C 没有独立的字符串类型，字符串就是「以 <code>'\0'</code> 结尾的字符数组」。</p>
<p><code>char s[] = "abc";</code> 占 4 个字节：<code>'a'</code>、<code>'b'</code>、<code>'c'</code>、<code>'\0'</code>。所以 <code>sizeof(s)</code> 是 4，<code>strlen(s)</code> 是 3。</p>`
      },
      {
        h: "输入输出与常用函数",
        html: String.raw`<ul class="list">
<li><code>scanf("%19s", s)</code>：遇空白停止，不检查长度，要自己限宽</li>
<li><code>fgets(s, sizeof(s), stdin)</code>：更安全，会读入换行</li>
<li><code>puts(s)</code>：输出并自动换行</li>
<li><code>strlen</code> 长度、<code>strcpy</code> 复制、<code>strcmp</code> 比较、<code>strcat</code> 拼接</li>
</ul>
<p><code>strcmp</code> 返回 0 表示相等，不要写成 <code>if (strcmp(a,b))</code> 来判断相等。</p>`
      }
    ],
    traps: [
      "用 == 比较字符串：比较的是地址，不是内容",
      "数组不够长，strcpy 越界",
      "忘记 '\\0'，strlen 一直往后读",
      "字符指针指向字符串常量却试图修改"
    ]
  },

  {
    id: "struct", title: "结构体", term: "final", minutes: 30,
    summary: "定义 / 初始化 / 成员访问 / 结构体数组",
    goals: [
      "会定义结构体类型并初始化",
      "分清 . 和 -> 的使用场景",
      "能对结构体数组按关键字排序"
    ],
    sections: [
      {
        h: "定义与访问",
        html: String.raw`<pre class="inline-code">struct Student {
    int id;
    char name[20];
    double score;
};

struct Student s = {1, "张三", 92.5};
printf("%s", s.name);      /* 变量用 . */
struct Student *p = &s;
printf("%s", p->name);     /* 指针用 -> */</pre>
<p><code>p-&gt;name</code> 等价于 <code>(*p).name</code>。</p>`
      },
      {
        h: "结构体数组排序",
        html: String.raw`<p>排序时比较关键字，交换整个记录。若要求「同分按学号」，先按学号稳定排序，再按分数稳定排序。</p>`
      }
    ],
    traps: [
      "结构体变量之间不能直接用 == 比较",
      "忘记分号：struct 定义末尾要 ;",
      "指针成员访问用 . 而不是 ->",
      "只交换了关键字，没交换整个结构体"
    ]
  },

  {
    id: "file", title: "文件操作", term: "final", minutes: 30,
    summary: "fopen / fclose / 读写模式 / feof",
    goals: [
      "记住文件操作四步：打开、读写、关闭",
      "分清 r/w/a 和 rb/wb/ab",
      "知道 feof 的正确用法"
    ],
    sections: [
      {
        h: "四步与打开模式",
        html: String.raw`<pre class="inline-code">FILE *fp = fopen("data.txt", "r");
if (fp == NULL) { /* 打开失败 */ }
/* 读写 */
fclose(fp);</pre>
<p><code>r</code> 只读，文件必须存在；<code>w</code> 只写，清空或新建；<code>a</code> 追加；加 <code>b</code> 是二进制模式。</p>`
      },
      {
        h: "feof 的常见误用",
        html: String.raw`<p><code>feof</code> 不是「预测是否还有数据」，而是「上一次读是否因为到达文件尾而失败」。正确写法是把读操作放在 while 条件里：</p>
<pre class="inline-code">while (fscanf(fp, "%d", &x) == 1) {
    /* 处理 x */
}</pre>`
      }
    ],
    traps: [
      "fopen 后不检查 NULL",
      "用完不 fclose",
      "用 feof 作为循环条件，最后一条数据被重复处理",
      "文本模式读二进制文件"
    ]
  },

  {
    id: "lib", title: "常用库函数", term: "final", minutes: 20,
    summary: "ctype.h / math.h / stdlib.h",
    goals: [
      "记住 isalpha、isdigit、toupper、tolower",
      "会用 fabs、sqrt、pow",
      "知道 atoi、qsort 的基本用法"
    ],
    sections: [
      {
        h: "三张速查表",
        html: String.raw`<table class="tbl"><thead><tr><th>头文件</th><th>常用函数</th></tr></thead><tbody>
<tr><td><code>ctype.h</code></td><td><code>isalpha</code>、<code>isdigit</code>、<code>isspace</code>、<code>toupper</code>、<code>tolower</code></td></tr>
<tr><td><code>math.h</code></td><td><code>fabs</code>、<code>sqrt</code>、<code>pow</code>、<code>ceil</code>、<code>floor</code></td></tr>
<tr><td><code>stdlib.h</code></td><td><code>atoi</code>、<code>atof</code>、<code>qsort</code>、<code>malloc</code>、<code>free</code></td></tr>
</tbody></table>
<p><code>fabs</code> 用于浮点，<code>abs</code> 用于整数，别混。</p>`
      }
    ],
    traps: [
      "对浮点用 abs，丢小数",
      "忘记 #include <math.h>",
      "atoi 不检查非法输入",
      "qsort 比较函数返回值写成布尔值"
    ]
  }
];

const TOTAL_MINUTES = CHAPTERS.filter(c => c.term === "mid").reduce((s, c) => s + c.minutes, 0);