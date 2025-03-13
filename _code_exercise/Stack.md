---
title: 栈(Stack)
author: saber5203
date: 2025-03-13
category: code_exercise
layout: post
---

### 栈是一种只允许在表尾进行插入和删除操作的线性表

在**Python**中，栈可以通过**list**实现
```python
    stack = []                # 创建一个空栈 or stack=list()
    stack.append(element)     # 入栈，元素压入栈顶
    top_element = stack.pop() # 出栈，弹出栈顶元素
    length = len(stack)       # 获取栈的长度
    stack[-1]                 # 访问栈顶元素
    stack.clear()             # 清空栈
```

同样在**TypeScript**中，栈也可以通过**Array**实现
```typescript
    const stack = []                // 创建一个空栈 or stack=Array()
    stack.push(element)             // 入栈，元素压入栈顶
    const top_element = stack.pop() // 出栈，弹出栈顶元素
    const length = stack.length     // 获取栈的长度
    stack[stack.length - 1]         // 访问栈顶元素
    stack.splice(0, stack.length)   // 清空栈
```

### LeetCode

#### 20.有效的括号[<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="2 -5 24 24" width="24px" fill="#4B77D1"><g><rect fill="none" height="24" width="24"/></g><g><polygon points="6,6 6,8 14.59,8 5,17.59 6.41,19 16,9.41 16,18 18,18 18,6"/></g></svg>](https://leetcode-cn.com/problems/valid-parentheses/)

**题目描述**：给定一个只包括 `(`, `)`, `{`, `}`, `[`, `]` 的字符串 `s`，判断字符串是否有效。

**有效字符串需满足**：

*   左括号必须用相同类型的右括号闭合。
*   左括号必须以正确的顺序闭合。
*   每个右括号都有一个对应的相同类型的左括号。

**示例 1**

*   输入：`s = "()"`
*   输出：`true`

**示例 2**

*   输入：`s = "()[]{}"`
*   输出：`true`

**示例 3**

*   输入：`s = "(]"`
*   输出：`false`

**示例 4**

*   输入：`s = "([])"`
*   输出：`true`

**提示**

*   `1 <= s.length <= 10^4`
*   `s` 仅由括号 `'()[]{}'` 组成

**解决方案**

```typescript
    function isValid(s: string): boolean {
        const stack = new Array();
        for(let i=0;i<s.length;i++){
            if(s[i]==='(' || s[i]==='[' || s[i]==='{'){
                stack.push(s[i]);
                continue;
            }
            else if(s[i]===')'){
                if(stack[stack.length-1]!=='(') return false
                else stack.pop()
            }
            else if(s[i]===']'){
                if(stack[stack.length-1]!=='[') return false
                else stack.pop()
            }
            else if(s[i]==='}'){
                if(stack[stack.length-1]!=='{') return false
                else stack.pop()
            }
        }
        return stack.length===0;
    };
```

**备注**

考察栈的基本使用，注意如果**最终栈不为空，即还有剩余的左括号，返回false**。

#### 394.字符串解码[<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="2 -5 24 24" width="24px" fill="#4B77D1"><g><rect fill="none" height="24" width="24"/></g><g><polygon points="6,6 6,8 14.59,8 5,17.59 6.41,19 16,9.41 16,18 18,18 18,6"/></g></svg>](https://leetcode-cn.com/problems/decode-string/)

**题目描述**：给定一个经过编码的字符串，返回它解码后的字符串。

编码规则为：k[encoded_string],表示其中方括号内部的 encoded_string 正好重复 k 次。注意 k 保证为正整数。

你可以认为输入字符串总是有效的;输入字符串中没有额外的空格，且输入的方括号总是符合格式要求的。

此外，你可以认为原始数据不包含数字，所有的数字只表示重复的次数 k ,例如不会出现像 3a 或 2[4] 这样的输入。

**示例 1**

*   输入：`s = "3[a]2[bc]"`
*   输出：`"aaabcbc"`

**示例 2**

*   输入：`s = "3[a2[c]]"`
*   输出：`"accaccacc"`

**示例 3**

*   输入：`s = "2[abc]3[cd]ef"`
*   输出：`"abcabccdcdcdef"`

**示例 4**

*   输入：`s = "abc3[cd]xyz"`
*   输出：`"abccdcdcdxyz"`

**提示**

*   `1 <= s.length <= 30`
*   `s` 由小写英文字母、数字和方括号 `[]` 组成
*   `s` 保证是一个有效的输入
*   `s` 中所有整数的取值范围为 `[1, 300]`

**解决方案**

```typescript
    function decodeString(s: string): string {
        const stack = new Array();
        for(let i=0;i<s.length;i++){
            if(s[i]===']'){
                let temp = ""
                while(stack[stack.length-1]!=='['){
                    temp = stack.pop() + temp;
                }
                stack.pop() // 弹出'['
                let repeatnum_str = ""
                while(!isNaN(Number(stack[stack.length-1]))){
                    repeatnum_str = stack.pop() + repeatnum_str;
                }
                const repeatnum = Number(repeatnum_str)
                let ans = ""
                for(let i=0;i<repeatnum;i++){
                    ans += temp;
                }
                for(let i=0;i<ans.length;i++){
                    stack.push(ans[i])
                }
            }
            else stack.push(s[i])
        }
        return stack.join("")
    };
```

**针对字符串变换问题的特殊解法————正则表达式**

```typescript
    function decodeString(s: string): string {
        const regexp = /(\d+)\[([a-z]+)\]/g
        let res = s
        while (regexp.test(res)) {
            res = res.replace(regexp, (_, repeat, str) => str.padEnd(str.length * repeat, str))
        }
        return res
    };
```

#### 739.每日温度[<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="2 -5 24 24" width="24px" fill="#4B77D1"><g><rect fill="none" height="24" width="24"/></g><g><polygon points="6,6 6,8 14.59,8 5,17.59 6.41,19 16,9.41 16,18 18,18 18,6"/></g></svg>](https://leetcode-cn.com/problems/daily-temperatures/)

#### 84.柱状图中最大的矩形[<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="2 -5 24 24" width="24px" fill="#4B77D1"><g><rect fill="none" height="24" width="24"/></g><g><polygon points="6,6 6,8 14.59,8 5,17.59 6.41,19 16,9.41 16,18 18,18 18,6"/></g></svg>](https://leetcode-cn.com/problems/largest-rectangle-in-histogram/)

