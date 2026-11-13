/* 非编程题：choice / output / fill */
const QUESTIONS = [
  { id:"q01", chapter:"expr", type:"choice", prompt:"执行 <code>int a = 5; printf(\"%d\", a++);</code>，输出是什么？", options:["5","6","4","未定义"], answer:0, explain:"<code>a++</code> 是「先用后加」：printf 拿到的是 5，之后 a 才变成 6。" },
  { id:"q02", chapter:"expr", type:"choice", prompt:"表达式 <code>4 &gt; 3 &gt; 2</code> 的值是？", options:["1","0","2","编译错误"], answer:1, explain:"关系运算左结合：<code>(4&gt;3)&gt;2</code> → <code>1&gt;2</code> → 0。C 没有数学上的连比。" },
  { id:"q03", chapter:"expr", type:"choice", prompt:"<code>float x = 10 / 4;</code> 之后 x 的值是？", options:["2.5","2.0","2","3.0"], answer:1, explain:"先算 <code>10/4</code>，两边都是 int，整数除法得 2；再转成 float 赋给 x，所以是 2.0。" },
  { id:"q04", chapter:"types", type:"choice", prompt:"在 C 语言中，<code>sizeof('A')</code> 的值通常是？", options:["1","2","4","8"], answer:2, explain:"C 里字符常量的类型是 <code>int</code>，所以 <code>sizeof('A')</code> 等于 <code>sizeof(int)</code>，通常是 4。C++ 里才是 1。" },
  { id:"q05", chapter:"array", type:"choice", prompt:"<code>sizeof(\"A\")</code> 的值是？", options:["1","2","4","8"], answer:1, explain:"字符串字面量末尾自动加 <code>'\\0'</code>，所以 <code>\"A\"</code> 占 2 个字节。" },
  { id:"q06", chapter:"types", type:"choice", prompt:"<code>char c = '\\101';</code> 中 c 的值是？", options:["65","101","8","49"], answer:0, explain:"<code>\\101</code> 是八进制转义，101₈ = 65，也就是 <code>'A'</code>。" },
  { id:"q07", chapter:"types", type:"choice", prompt:"<code>0x41</code> 对应的十进制值是？", options:["41","65","33","97"], answer:1, explain:"0x 开头是十六进制，41₁₆ = 4×16 + 1 = 65，也就是 <code>'A'</code>。" },
  { id:"q08", chapter:"expr", type:"choice", prompt:"在 C 语言中，<code>-7 % 3</code> 的结果是？", options:["1","-1","2","-2"], answer:1, explain:"C 的取余结果符号跟随被除数：-7 % 3 = -1。数学上的「余数」通常取非负，但 C 不这样规定。" },
  { id:"q09", chapter:"expr", type:"choice", prompt:"<code>x *= y + z;</code> 等价于下面哪个？", options:["x = y + z","x = x * y + z","x = x * (y + z)","x = x + y * z"], answer:2, explain:"复合赋值等价于 <code>E1 = E1 op (E2)</code>，右边的 <code>y + z</code> 要整体加括号。" },
  { id:"q10", chapter:"branch", type:"choice", prompt:"<code>if (a = 0) { ... }</code> 中的条件？", options:["a 等于 0 时成立","a 不等于 0 时成立","永远不成立","编译错误"], answer:2, explain:"这是赋值不是比较，表达式的值是 0，所以条件永远为假。应写成 <code>a == 0</code>。" },
  { id:"q11", chapter:"loop", type:"choice", prompt:"下面哪种循环至少执行一次循环体？", options:["for","while","do-while","都一样"], answer:2, explain:"do-while 先执行再判断，所以至少执行一次；for 和 while 可能一次都不执行。" },
  { id:"q12", chapter:"loop", type:"choice", prompt:"在 <code>for</code> 循环中执行 <code>continue</code>，会跳到哪里？", options:["循环条件判断","更新表达式（如 i++）","循环体外","函数返回处"], answer:1, explain:"for 的 continue 跳到更新表达式；while 跳到条件判断；do-while 跳到循环底部的条件判断。" },
  { id:"q13", chapter:"branch", type:"choice", prompt:"<code>switch</code> 的某个 case 后面忘记写 <code>break</code>，会发生什么？", options:["编译错误","只执行该 case","继续执行后面的 case（穿透）","直接退出程序"], answer:2, explain:"没有 break 会「case 穿透」，从匹配的 case 开始一直往下执行，直到遇到 break 或 switch 结束。" },
  { id:"q14", chapter:"branch", type:"choice", prompt:"关于 <code>else</code> 的配对，正确的是？", options:["与第一个 if 配对","与最近的、尚未配对的 if 配对","与缩进对齐的 if 配对","必须用花括号才能配对"], answer:1, explain:"else 总是与最近的、尚未配对的 if 配对，和缩进无关。要用花括号明确范围。" },
  { id:"q15", chapter:"array", type:"choice", prompt:"下面哪个二维数组定义是合法的？", options:["int a[][];","int b[3][];","int c[][4] = {{1,2,3,4}};","int d[2][] = {{1,2}};"], answer:2, explain:"二维数组列数不能省，行数可以省。c 的列数 4 已给出，行数由初始化列表数出来。" },
  { id:"q16", chapter:"array", type:"choice", prompt:"<code>int a[5] = {1, 2};</code> 中 <code>a[4]</code> 的值是？", options:["0","2","垃圾值","编译错误"], answer:0, explain:"初始化列表没有覆盖到的元素自动补 0，所以 a[2]、a[3]、a[4] 都是 0。" },
  { id:"q17", chapter:"func", type:"choice", prompt:"<code>void swap(int a, int b) { int t=a; a=b; b=t; }</code> 能交换调用者的两个变量吗？", options:["能","不能，形参是副本","能，只要名字相同","取决于编译器"], answer:1, explain:"C 只有值传递，形参是实参的副本，改形参不影响实参。要真正交换必须传地址。" },
  { id:"q18", chapter:"func", type:"choice", prompt:"下面哪个函数定义是错误的？", options:["void f(void) { return; }","void f(int i) { }","void f(int i) { return i+1; }","int f(void) { return 0; }"], answer:2, explain:"void 函数不能 return 一个值，只能写 <code>return;</code> 或不写 return。" },
  { id:"q19", chapter:"array", type:"choice", prompt:"在 64 位系统上，<code>void f(int a[10]) { printf(\"%d\", (int)sizeof(a)); }</code> 输出什么？", options:["40","10","8","4"], answer:2, explain:"数组作函数参数后退化成指针，sizeof(a) 得到的是指针大小，64 位下是 8。长度必须另外传。" },
  { id:"q20", chapter:"recur", type:"choice", prompt:"递归函数缺少终止条件，最可能发生什么？", options:["编译错误","返回 0","无限递归，栈溢出","自动改为循环"], answer:2, explain:"每次调用都会压栈，没有终止条件就永远不会返回，最终栈空间耗尽，程序崩溃。" },
  { id:"q21", chapter:"sort", type:"choice", prompt:"下面哪组排序算法都是稳定的？", options:["冒泡、选择、插入","冒泡、插入、归并","快排、归并、堆排","选择、快排、希尔"], answer:1, explain:"冒泡、插入、归并在相等元素处不跨越，是稳定的；选择、快排、堆排、希尔通常不稳定。" },
  { id:"q22", chapter:"sort", type:"choice", prompt:"快速排序的最坏时间复杂度是？", options:["O(n)","O(n log n)","O(n²)","O(log n)"], answer:2, explain:"每次划分都极不平衡时（例如已排序数组 + 固定取首元素作 pivot），递归 n 层，最坏 O(n²)。" },
  { id:"q23", chapter:"sort", type:"choice", prompt:"归并排序通常需要多少额外空间？", options:["O(1)","O(log n)","O(n)","O(n²)"], answer:2, explain:"合并两个有序段需要一个和原数组同规模的临时数组，所以额外空间是 O(n)。" },
  { id:"q24", chapter:"sort", type:"choice", prompt:"选择排序的稳定性是？", options:["稳定","不稳定","取决于数据","取决于编译器"], answer:1, explain:"选择排序会把后面的最小元素和前面交换，可能跨越相等元素。反例：{2a, 2b, 1} 第一轮后变成 {1, 2b, 2a}。" },

  { id:"q25", chapter:"loop", type:"output", prompt:"下面程序输出什么？<pre class=\"inline-code\">int i = 5, s = 0;\ndo {\n    if (i % 2) continue;\n    else s += i;\n} while (--i);\nprintf(\"%d\", s);</pre>", answer:"6", explain:"i 依次为 5、4、3、2、1；偶数 4 和 2 被累加，s = 6。do-while 的 continue 会走到条件，--i 仍执行。" },
  { id:"q26", chapter:"loop", type:"output", prompt:"下面程序输出什么？<pre class=\"inline-code\">int m;\nfor (m = 0; m &lt; 9; m++) m++;\nprintf(\"%d\", m);</pre>", answer:"10", explain:"m 进入循环体依次为 0、2、4、6、8；最后一次 8→9，末尾更新 9→10，条件 10<9 为假，退出。" },
  { id:"q27", chapter:"loop", type:"output", prompt:"下面程序输出什么？<pre class=\"inline-code\">int n = 1234, sum = 0;\nwhile (n != 0) {\n    sum += n % 10;\n    n /= 10;\n}\nprintf(\"%d\", sum);</pre>", answer:"10", explain:"末位依次是 4、3、2、1，和为 10。" },
  { id:"q28", chapter:"expr", type:"output", prompt:"下面程序输出什么？<pre class=\"inline-code\">int a, i;\nfor (a = 1, i = -1; -1 &lt;= i &lt; 1; i++) {\n    a++;\n    printf(\"%2d\", a);\n}\nprintf(\"%2d\", i);</pre>", answer:"-1", explain:"条件实际是 <code>(-1&lt;=i)&lt;1</code>。i=-1 时 <code>1&lt;1</code> 为假，循环一次都不执行，最后输出 i=-1。" },
  { id:"q29", chapter:"recur", type:"output", prompt:"数组 <code>{1, 2, 3}</code>，调用下面的函数后输出什么？<pre class=\"inline-code\">void print_backward(int a[], int i, int n) {\n    if (i == n) return;\n    print_backward(a, i + 1, n);\n    printf(\"%d \", a[i]);\n}</pre>", answer:"3 2 1", explain:"printf 在递归调用之后，最内层最先返回，所以是逆序输出。" },
  { id:"q30", chapter:"sort", type:"output", prompt:"对 <code>{3, 50, 27, 46, 44, 20}</code> 做一趟冒泡（从左到右，大的往后冒），结果是什么？", answer:"3 27 46 44 20 50", explain:"50 依次和 27、46、44、20 交换，最后冒到末尾；其余元素相对位置不变。" },
  { id:"q31", chapter:"recur", type:"output", prompt:"<code>factorial(4)</code> 的返回值是多少？<pre class=\"inline-code\">long long factorial(int n) {\n    if (n &lt;= 1) return 1;\n    return n * factorial(n - 1);\n}</pre>", answer:"24", explain:"4 × 3 × 2 × 1 = 24。" },
  { id:"q32", chapter:"array", type:"output", prompt:"<code>char s[] = \"abc\";</code> 中 <code>sizeof(s)</code> 和 <code>strlen(s)</code> 分别是多少？", answer:"4 3", explain:"sizeof 算数组总大小，包含结尾的 '\\0'，是 4；strlen 数到 '\\0' 为止，是 3。" },

  { id:"q33", chapter:"func", type:"fill", prompt:"补全素数判断的循环条件（要求防止 i*i 溢出）：<pre class=\"inline-code\">int is_prime(int x) {\n    if (x &lt; 2) return 0;\n    for (int d = 2; ______ ; d++)\n        if (x % d == 0) return 0;\n    return 1;\n}</pre>", blanks:[{label:"循环条件", answer:"d <= x / d", accept:["d<=x/d","d <= x/d","d<= x / d"]}], explain:"<code>d &lt;= x / d</code> 等价于 <code>d*d &lt;= x</code>，但不会溢出。" },
  { id:"q34", chapter:"sort", type:"fill", prompt:"补全插入排序的内层循环：<pre class=\"inline-code\">for (int i = 1; i &lt; n; i++) {\n    int key = a[i], j = i - 1;\n    while (______) {\n        a[j + 1] = a[j];\n        j--;\n    }\n    a[j + 1] = key;\n}</pre>", blanks:[{label:"while 条件", answer:"j >= 0 && a[j] > key", accept:["j>=0&&a[j]>key","j >= 0 && a[j] > key"]}], explain:"必须先判断 <code>j &gt;= 0</code>，利用 && 短路，避免访问 a[-1]。" },
  { id:"q35", chapter:"sort", type:"fill", prompt:"补全冒泡排序的内层循环边界：<pre class=\"inline-code\">for (int i = n - 1; i &gt;= 1; i--)\n    for (int j = 0; ______ ; j++)\n        if (a[j] &gt; a[j + 1]) { /* 交换 */ }</pre>", blanks:[{label:"内层条件", answer:"j < i", accept:["j<i","j < i"]}], explain:"每轮结束后 a[i] 已经归位，内层只需要比较到 i-1，所以写 <code>j &lt; i</code>。" },
  { id:"q36", chapter:"sort", type:"fill", prompt:"补全归并排序的合并比较，使排序保持稳定：<pre class=\"inline-code\">while (i &lt;= m && j &lt;= r) {\n    if (______) tmp[k++] = a[i++];\n    else        tmp[k++] = a[j++];\n}</pre>", blanks:[{label:"if 条件", answer:"a[i] <= a[j]", accept:["a[i]<=a[j]","a[i] <= a[j]"]}], explain:"用 <code>&lt;=</code> 时相等元素优先取左边，保持稳定性。" },
  { id:"q37", chapter:"sort", type:"fill", prompt:"补全快排 partition 的返回值：<pre class=\"inline-code\">while (1) {\n    do { i++; } while (a[i] &lt; pivot);\n    do { j--; } while (a[j] &gt; pivot);\n    if (i &gt;= j) return ______;\n    /* 交换 a[i], a[j] */\n}</pre>", blanks:[{label:"返回值", answer:"j", accept:["j"]}], explain:"循环结束时 j 是左半区最后一个位置，递归区间是 [l, j] 和 [j+1, r]。" },
  { id:"q38", chapter:"recur", type:"fill", prompt:"补全递归二分查找的中间下标（防止 lo+hi 溢出）：<pre class=\"inline-code\">int mid = ______;\nif (a[mid] == key) return mid;</pre>", blanks:[{label:"mid", answer:"lo + (hi - lo) / 2", accept:["lo+(hi-lo)/2","lo + (hi - lo) / 2"]}], explain:"<code>lo + (hi - lo) / 2</code> 与 <code>(lo + hi) / 2</code> 数学等价，但不会溢出。" },
  { id:"q39", chapter:"array", type:"fill", prompt:"补全求数组元素个数的表达式：<pre class=\"inline-code\">int a[10];\nint n = ______;</pre>", blanks:[{label:"元素个数", answer:"sizeof(a) / sizeof(a[0])", accept:["sizeof(a)/sizeof(a[0])","sizeof(a) / sizeof(a[0])"]}], explain:"总字节数除以单个元素字节数。注意：数组传进函数后这个公式失效。" },
  { id:"q40", chapter:"str", type:"fill", prompt:"C 字符串的结束标志是什么？（写成字符常量）", blanks:[{label:"结束标志", answer:"'\\0'", accept:["'\\0'","'\\0'","0"]}], explain:"字符串以空字符 <code>'\\0'</code>（ASCII 0）结尾，strlen 靠它判断结束。" }
];

/* 编程题 */
const CODING = [
  {
    id:"c1", chapter:"io", title:"出租车费", level:"入门",
    statement:"杭州出租车：前 3 公里起步价 13 元；超过 3 公里后每公里 2.5 元；超过 10 公里的部分，每公里再加收 1.25 元返空费。读入两个里程表读数，输出行驶距离和费用，均保留两位小数。",
    inputFormat:"一行两个实数，表示起始和结束里程。",
    outputFormat:"一行两个实数，用空格分隔，均保留两位小数。",
    sampleInput:"78602.5 78622.7", sampleOutput:"20.20 68.75",
    hints:[
      "先算 distance = end - begin。",
      "起步价只加一次，3 公里以上和 10 公里以上的部分分别用两个独立的 if 累加。",
      "两个 if 不能写成 else if：d > 10 时两个条件都成立，两笔费用都要加。"
    ],
    starter:String.raw`#include <stdio.h>

double fare(double distance)
{
    /* 在这里实现 */
    
}

int main(void)
{
    double begin, end;
    scanf("%lf %lf", &begin, &end);
    double distance = end - begin;
    printf("%.2f %.2f\n", distance, fare(distance));
    return 0;
}`,
    solution:String.raw`#include <stdio.h>

double fare(double distance)
{
    double result = 13.0;
    if (distance > 3.0) {
        result += (distance - 3.0) * 2.5;
    }
    if (distance > 10.0) {
        result += (distance - 10.0) * 1.25;
    }
    return result;
}

int main(void)
{
    double begin, end;
    scanf("%lf %lf", &begin, &end);
    double distance = end - begin;
    printf("%.2f %.2f\n", distance, fare(distance));
    return 0;
}`,
    tests:[
      { name:"样例", input:"78602.5 78622.7", expected:"20.20 68.75" },
      { name:"刚好 3 公里", input:"0 3", expected:"3.00 13.00" },
      { name:"刚好 10 公里", input:"0 10", expected:"10.00 30.50" },
      { name:"20 公里", input:"0 20", expected:"20.00 68.00" }
    ]
  },
  {
    id:"c2", chapter:"func", title:"大于 m 的最小素数", level:"入门",
    statement:"输入一个正整数 m，输出大于 m 的最小素数。",
    inputFormat:"一个正整数 m。",
    outputFormat:"一个整数，表示大于 m 的最小素数。",
    sampleInput:"12", sampleOutput:"13",
    hints:[
      "先写 is_prime(x)：x < 2 不是素数；从 2 试到 x / x，能整除就不是素数。",
      "从 m + 1 开始逐个检查，找到第一个素数就输出。",
      "注意 1 不是素数，2 是唯一的偶素数。"
    ],
    starter:String.raw`#include <stdio.h>

int is_prime(int x)
{
    /* 在这里实现 */
    
}

int main(void)
{
    int m;
    scanf("%d", &m);
    /* 从 m + 1 开始找 */
    
    return 0;
}`,
    solution:String.raw`#include <stdio.h>

int is_prime(int x)
{
    if (x < 2) return 0;
    for (int d = 2; d <= x / d; d++) {
        if (x % d == 0) return 0;
    }
    return 1;
}

int main(void)
{
    int m;
    scanf("%d", &m);
    int n = m + 1;
    while (!is_prime(n)) {
        n++;
    }
    printf("%d\n", n);
    return 0;
}`,
    tests:[
      { name:"样例", input:"12", expected:"13" },
      { name:"m = 1", input:"1", expected:"2" },
      { name:"m = 2", input:"2", expected:"3" },
      { name:"m = 13", input:"13", expected:"17" }
    ]
  },
  {
    id:"c3", chapter:"loop", title:"前 n 个素数之和", level:"基础",
    statement:"读入正整数 n（n < 1000），求从 2 开始的前 n 个素数之和。",
    inputFormat:"一个正整数 n。",
    outputFormat:"一个整数，表示前 n 个素数之和。",
    sampleInput:"10", sampleOutput:"129",
    hints:[
      "把任务拆成两层：is_prime(x) 判断素数；主循环累计个数。",
      "count 表示「已经找到几个素数」，candidate 表示「下一个要检查的数」，两者不能混。",
      "不管是不是素数，candidate 每轮都要加 1；count 只在是素数时加 1。"
    ],
    starter:String.raw`#include <stdio.h>

int is_prime(int x)
{
    if (x < 2) return 0;
    for (int d = 2; d <= x / d; d++)
        if (x % d == 0) return 0;
    return 1;
}

int main(void)
{
    int n;
    scanf("%d", &n);
    /* 累计前 n 个素数 */
    
    return 0;
}`,
    solution:String.raw`#include <stdio.h>

int is_prime(int x)
{
    if (x < 2) return 0;
    for (int d = 2; d <= x / d; d++)
        if (x % d == 0) return 0;
    return 1;
}

int main(void)
{
    int n;
    scanf("%d", &n);

    int count = 0, candidate = 2, sum = 0;
    while (count < n) {
        if (is_prime(candidate)) {
            sum += candidate;
            count++;
        }
        candidate++;
    }
    printf("%d\n", sum);
    return 0;
}`,
    tests:[
      { name:"样例", input:"10", expected:"129" },
      { name:"n = 1", input:"1", expected:"2" },
      { name:"n = 5", input:"5", expected:"28" }
    ]
  },
  {
    id:"c4", chapter:"array", title:"数组循环左移", level:"基础",
    statement:"读入 n 个整数，将它们循环左移 m 位后输出。例如 1 2 3 4 5 左移 2 位得到 3 4 5 1 2。",
    inputFormat:"第一行两个整数 n 和 m（n > 0，m ≥ 0）。第二行 n 个整数。",
    outputFormat:"一行 n 个整数，用空格分隔。",
    sampleInput:"5 2\n1 2 3 4 5", sampleOutput:"3 4 5 1 2",
    hints:[
      "m 可能大于 n，先做 m %= n。",
      "三次翻转：翻转前 m 个、翻转后 n-m 个、翻转整个数组。",
      "翻转用双指针向中间交换，不需要额外数组。"
    ],
    starter:String.raw`#include <stdio.h>

void reverse(int a[], int l, int r)
{
    /* 在这里实现 */
    
}

void left_shift(int a[], int n, int m)
{
    /* 在这里实现 */
    
}

int main(void)
{
    int n, m, a[1000];
    scanf("%d %d", &n, &m);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    left_shift(a, n, m);
    for (int i = 0; i < n; i++) {
        if (i) printf(" ");
        printf("%d", a[i]);
    }
    printf("\n");
    return 0;
}`,
    solution:String.raw`#include <stdio.h>

void reverse(int a[], int l, int r)
{
    while (l < r) {
        int t = a[l]; a[l] = a[r]; a[r] = t;
        l++; r--;
    }
}

void left_shift(int a[], int n, int m)
{
    if (n <= 0) return;
    m %= n;
    if (m == 0) return;
    reverse(a, 0, m - 1);
    reverse(a, m, n - 1);
    reverse(a, 0, n - 1);
}

int main(void)
{
    int n, m, a[1000];
    scanf("%d %d", &n, &m);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    left_shift(a, n, m);
    for (int i = 0; i < n; i++) {
        if (i) printf(" ");
        printf("%d", a[i]);
    }
    printf("\n");
    return 0;
}`,
    tests:[
      { name:"样例", input:"5 2\n1 2 3 4 5", expected:"3 4 5 1 2" },
      { name:"m 大于 n", input:"5 7\n1 2 3 4 5", expected:"3 4 5 1 2" },
      { name:"m = 0", input:"3 0\n7 8 9", expected:"7 8 9" },
      { name:"n = 1", input:"1 5\n42", expected:"42" }
    ]
  },
  {
    id:"c5", chapter:"array", title:"找鞍点", level:"进阶",
    statement:"矩阵中的「鞍点」是指该位置上的元素在该行上最大、在该列上最小。求一个 n 阶方阵的鞍点，输出行下标和列下标（从 0 开始）；不存在输出 NONE。题目保证至多存在一个鞍点。",
    inputFormat:"第一行一个正整数 n（1 ≤ n ≤ 6）。随后 n 行，每行 n 个整数。",
    outputFormat:"一行，鞍点的「行下标 列下标」，或 NONE。",
    sampleInput:"4\n1 6 7 1\n4 8 3 6\n1 6 6 2\n0 7 8 9", sampleOutput:"2 1",
    hints:[
      "枚举每一个位置 (i, j)，检查它是不是本行最大、本列最小。",
      "用两个标记 rowMax 和 colMin，逐个和同行、同列的元素比较。",
      "n ≤ 6，O(n³) 最多 216 次比较，直接做最清楚。"
    ],
    starter:String.raw`#include <stdio.h>

int main(void)
{
    int n, a[6][6];
    scanf("%d", &n);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            scanf("%d", &a[i][j]);

    /* 枚举每个位置，检查是否为本行最大、本列最小 */
    
    printf("NONE\n");
    return 0;
}`,
    solution:String.raw`#include <stdio.h>

int main(void)
{
    int n, a[6][6];
    scanf("%d", &n);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            scanf("%d", &a[i][j]);

    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            int rowMax = 1, colMin = 1;
            for (int k = 0; k < n; k++) {
                if (a[i][k] > a[i][j]) rowMax = 0;
                if (a[k][j] < a[i][j]) colMin = 0;
            }
            if (rowMax && colMin) {
                printf("%d %d\n", i, j);
                return 0;
            }
        }
    }
    printf("NONE\n");
    return 0;
}`,
    tests:[
      { name:"样例", input:"4\n1 6 7 1\n4 8 3 6\n1 6 6 2\n0 7 8 9", expected:"2 1" },
      { name:"2x2", input:"2\n1 2\n3 4", expected:"0 1" },
      { name:"无鞍点", input:"2\n1 2\n2 1", expected:"NONE" },
      { name:"n = 1", input:"1\n5", expected:"0 0" }
    ]
  },
  {
    id:"c6", chapter:"recur", title:"汉诺塔", level:"进阶",
    statement:"输入圆盘数 n，以及起始柱、目标柱、过渡柱三个字符，输出移动汉诺塔的每一步。每行格式为「盘片号: 起始柱 -> 目标柱」。盘片号从 1 开始，由小到大编号。",
    inputFormat:"第一行一个整数 n。第二行三个字符，依次表示起始柱、目标柱、过渡柱。",
    outputFormat:"每一步一行，格式为「盘片号: 起始柱 -> 目标柱」。",
    sampleInput:"3\na c b", sampleOutput:"1: a -> c\n2: a -> b\n1: c -> b\n3: a -> c\n1: b -> a\n2: b -> c\n1: a -> c",
    hints:[
      "三行公式：把 n 个盘从 from 搬到 to；先搬 n-1 个到 via，再搬最大盘，再把 n-1 个搬到 to。",
      "递归调用里参数要跟着换位：hanoi(n-1, from, via, to) 和 hanoi(n-1, via, to, from)。",
      "输入第三个是目标柱、第四个是过渡柱，函数参数顺序别写反。"
    ],
    starter:String.raw`#include <stdio.h>

void hanoi(int n, char from, char to, char via)
{
    /* 在这里实现 */
    
}

int main(void)
{
    int n;
    char from, to, via;
    scanf("%d", &n);
    scanf(" %c %c %c", &from, &to, &via);
    hanoi(n, from, to, via);
    return 0;
}`,
    solution:String.raw`#include <stdio.h>

void hanoi(int n, char from, char to, char via)
{
    if (n == 1) {
        printf("%d: %c -> %c\n", n, from, to);
        return;
    }
    hanoi(n - 1, from, via, to);
    printf("%d: %c -> %c\n", n, from, to);
    hanoi(n - 1, via, to, from);
}

int main(void)
{
    int n;
    char from, to, via;
    scanf("%d", &n);
    scanf(" %c %c %c", &from, &to, &via);
    hanoi(n, from, to, via);
    return 0;
}`,
    tests:[
      { name:"样例", input:"3\na c b", expected:"1: a -> c\n2: a -> b\n1: c -> b\n3: a -> c\n1: b -> a\n2: b -> c\n1: a -> c" },
      { name:"n = 1", input:"1\na c b", expected:"1: a -> c" },
      { name:"n = 2", input:"2\na c b", expected:"1: a -> b\n2: a -> c\n1: b -> c" }
    ]
  },
  {
    id:"c7", chapter:"recur", title:"递归二分查找", level:"进阶",
    statement:"读入 n 个从小到大有序的整数，再读入一个关键字 key，用递归二分查找输出 key 的下标；找不到输出 -1。",
    inputFormat:"第一行一个整数 n。第二行 n 个有序整数。第三行一个整数 key。",
    outputFormat:"一个整数，表示下标或 -1。",
    sampleInput:"7\n1 3 5 7 9 11 13\n7", sampleOutput:"3",
    hints:[
      "终止条件有两个：找到（a[mid] == key）和找不到（lo > hi）。",
      "mid 写成 lo + (hi - lo) / 2，防止 lo + hi 溢出。",
      "根据 a[mid] 和 key 的大小，递归到左半段或右半段。"
    ],
    starter:String.raw`#include <stdio.h>

int bsearch_rec(const int a[], int lo, int hi, int key)
{
    /* 在这里实现 */
    
}

int main(void)
{
    int n, key, a[1000];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    scanf("%d", &key);
    printf("%d\n", bsearch_rec(a, 0, n - 1, key));
    return 0;
}`,
    solution:String.raw`#include <stdio.h>

int bsearch_rec(const int a[], int lo, int hi, int key)
{
    if (lo > hi) return -1;
    int mid = lo + (hi - lo) / 2;
    if (a[mid] == key) return mid;
    if (a[mid] < key) return bsearch_rec(a, mid + 1, hi, key);
    return bsearch_rec(a, lo, mid - 1, key);
}

int main(void)
{
    int n, key, a[1000];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    scanf("%d", &key);
    printf("%d\n", bsearch_rec(a, 0, n - 1, key));
    return 0;
}`,
    tests:[
      { name:"样例", input:"7\n1 3 5 7 9 11 13\n7", expected:"3" },
      { name:"找不到", input:"7\n1 3 5 7 9 11 13\n8", expected:"-1" },
      { name:"第一个", input:"7\n1 3 5 7 9 11 13\n1", expected:"0" },
      { name:"最后一个", input:"7\n1 3 5 7 9 11 13\n13", expected:"6" }
    ]
  },
  {
    id:"c8", chapter:"sort", title:"冒泡排序", level:"基础",
    statement:"读入 n 个整数，用冒泡排序按从小到大排序后输出。",
    inputFormat:"第一行一个整数 n。第二行 n 个整数。",
    outputFormat:"一行 n 个整数，用空格分隔。",
    sampleInput:"6\n3 50 27 46 44 20", sampleOutput:"3 20 27 44 46 50",
    hints:[
      "外层 i 从 n-1 递减到 1，表示本轮比较的右边界。",
      "内层 j 从 0 到 i-1，比较 a[j] 和 a[j+1]。",
      "用 > 比较，相等不交换，保证稳定。"
    ],
    starter:String.raw`#include <stdio.h>

void bubble_sort(int a[], int n)
{
    /* 在这里实现 */
    
}

int main(void)
{
    int n, a[1000];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    bubble_sort(a, n);
    for (int i = 0; i < n; i++) {
        if (i) printf(" ");
        printf("%d", a[i]);
    }
    printf("\n");
    return 0;
}`,
    solution:String.raw`#include <stdio.h>

void bubble_sort(int a[], int n)
{
    for (int i = n - 1; i >= 1; i--) {
        for (int j = 0; j < i; j++) {
            if (a[j] > a[j + 1]) {
                int t = a[j];
                a[j] = a[j + 1];
                a[j + 1] = t;
            }
        }
    }
}

int main(void)
{
    int n, a[1000];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    bubble_sort(a, n);
    for (int i = 0; i < n; i++) {
        if (i) printf(" ");
        printf("%d", a[i]);
    }
    printf("\n");
    return 0;
}`,
    tests:[
      { name:"样例", input:"6\n3 50 27 46 44 20", expected:"3 20 27 44 46 50" },
      { name:"n = 1", input:"1\n5", expected:"5" },
      { name:"逆序", input:"5\n5 4 3 2 1", expected:"1 2 3 4 5" },
      { name:"含重复", input:"6\n2 1 2 1 2 1", expected:"1 1 1 2 2 2" }
    ]
  }
];

const TYPE_LABEL = { choice: "选择题", output: "手算输出", fill: "代码填空" };