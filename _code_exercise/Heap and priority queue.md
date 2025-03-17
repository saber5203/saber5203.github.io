---
title: 堆和优先队列(Heap and priority queue)
author: saber5203
date: 2025-03-16
category: code_exercise
layout: post
---

**堆是一种可以看作一颗完全二叉树的顺序表/数组**

堆总是满足以下属性之一：

*   堆中任意父节点的值总是大于或等于其子节点的值——**大根堆**
*   堆中任意父节点的值总是小于或等于其子节点的值——**小根堆**

<strong>优先队列是一种可以完成插入和<span style="color: red">按照优先级出队</span>的队列，堆是实现优先队列的一种方式(顺序优先队列，数组存储)</strong>

**由数组构建堆(优先队列)：**

*   将数组元素视为一颗完全二叉树，从最后一个非叶子节点到根节点`(0-index)`依次进行调整`(heapify)`
*   `heapify(i-index)`逻辑：比较当前父节点`(i)`与其左孩子`(2*i+1)`和右孩子`(2*i+2)`的值(或者说优先级)，若某个孩子的值大于(小于)父节点的值，则将该孩子与父节点交换，并对交换后的该孩子结点递归调用`heapify()`

```typescript
    function CreateMaxHeapFromArray(nums: number[]): number[] {
        const heapify = (nums: number[], heapsize: number, index: number)=>{
            // 递归调整为大根堆，只用递归发生交换的孩子结点
            let largest_index = index
            const left_index = index*2+1
            const right_index = index*2+2
            if(left_index<heapsize && nums[left_index]>nums[largest_index]){
                largest_index = left_index
            }
            if(right_index<heapsize && nums[right_index]>nums[largest_index]){
                largest_index = right_index
            }
            if(largest_index!=index){
                [nums[index], nums[largest_index]] = [nums[largest_index], nums[index]]
                heapify(nums, heapsize, largest_index)
            }
        }
        const n = nums.length
        for(let i = Math.floor(n/2-1);i>=0;i--){
            // 从最后一个非叶子节点开始构建最大堆
            // 完全二叉树：leaf = node1 + node2(n为偶数) or leaf = node1 + node2 + 1(n为奇数)
            // node1为出度1节点个数，node2为出度2节点个数(node1+node2为非叶子节点个数，leaf为叶子节点个数)
            heapify(nums, n, i)
        }
        return nums
    };
```

**堆(优先队列)的插入——节点上浮O(logN)**

*   将新元素添加到数组末尾作为一个新的叶子节点
*   循环比较新节点与其父节点的值(或者说优先级)，直到不再发生交换，或者到达根节点

**堆(优先队列)的删除——节点下沉O(logN)**

*   将根节点`(0-index)`弹出
*   将最后一个叶子节点(数组最后一个元素)移动到根节点
*   循环比较新的根节点与其孩子节点的值(或者说优先级)，直到不再发生交换，或者到达叶子节点

**堆排序O(NlogN)**

*   将输入的数组建成最大堆。此时，堆顶元素就是最大值
*   交换堆顶元素和末尾元素。此时，末尾元素是最大值
*   将剩下`n-1`个元素重新构造成一个堆，重复执行上述步骤，直到剩下`0`个元素

在**Python**中，堆可以通过**heapq**模块实现

```python
    import heapq
    # 1.创建堆
    # 方法一：定义一个空列表，然后使用heapq.heqppush(item)函数把元素加入到堆中
    item = 2
    heap = []
    heapq.heappush(heap,item)
    # 方法二：使用heapq.heapify(list)将列表转换为堆结构
    heap = [2,0,4,1]
    heapq.heapify(heap)

    # 2.heapq.heappush() 添加新元素 num
    num = 3
    heapq.heappush(heap,num)

    # 3.heapq.heappop() 删除并返回堆顶元素
    heaptop = heapq.heappop(heap)

    # 4.heapq.heappushpop() 比较添加元素num与堆顶元素的大小:
    # 如果num>堆顶元素，删除并返回堆顶元素，然后添加新元素num;
    # 如果num<堆顶元素，返回num，原堆不变
    # 其实也就等价于先添加新元素num，然后删除并返回堆顶元素
    # 适用于Topk最大问题
    num = -2
    heaptop = heapq.heappushpop(heap,num) # => heapq.heappush(heap,num) heaptop = heapq.heappop(heap)

    # 5.heapq.heapreplace() 先删除并返回堆顶元素，然后添加新元素num
    num = 5
    heaptop = heapq.heapreplace(heap,num) # => heaptop = heapq.heappop(heap) heapq.heappush(heap,num)

    # 6. heapq.merge() 合并多个排序后的序列成一个排序后的序列， 返回排序后的值的生成器。
    heap1 = [1,3,5,7]
    heap2 = [2,4,6,8]
    heap = heapq.merge(heap1,heap2)
    print(list(heap)) # [1, 2, 3, 4, 5, 6, 7, 8]

    # 7.heapq.nsmallest() 查询堆中的最小n个元素
    n = 3
    heap = [1,3,5,7,2,4,6,8]
    print(heapq.nsmallest(n,heap)) # [1,2,3]

    # 8.heapq.nlargest() 查询堆中的最大n个元素
    n = 3
    heap = [1,3,5,7,2,4,6,8]
    print(heapq.nlargest(n,heap)) # [8,7,6]
```

在**JavaScript**中，堆的类实现如下

```javascript
    class MaxHeap {
        constructor(heap) {
            this.heap = heap;
            this.heapSize = heap.length;
            this.buildMaxHeap();
        }

        // 构建最大堆
        buildMaxHeap() {
            for (let i = Math.floor(this.heapSize / 2) - 1; i >= 0; i--) {
                this.maxHeapify(i);
            }
        }

        //将以i为根节点的子树调整为最大堆
        maxHeapify(index) {
            let left = 2 * index + 1;
            let right = 2 * index + 2;
            let largest = index;
            if (left < this.heapSize && this.heap[left] > this.heap[largest]) largest = left;
            if (right < this.heapSize && this.heap[right] > this.heap[largest]) largest = right;
            if (largest !== index) {
                this.swapNum(index, largest);
                this.maxHeapify(largest);
            }
        }

        //交换i，j的值
        swapNum(i, j) {
            let temp = this.heap[i];
            this.heap[i] = this.heap[j];
            this.heap[j] = temp;
        }

        //插入一个数
        insert(num) {
            this.heap.push(num);
            this.heap.heapSize = this.heap.length;
            let index = this.heap.heapSize - 1;
            while (index != -1) {
                index = this.shiftUp(index);
            }
            console.log(this.heap);
        }

        //删除堆顶元素
        pop() {
            this.swapNum(0, this.heapSize - 1);
            this.heap.pop();
            this.heapSize = this.heap.length;
            let index = 0;
            while (1) {
                let temp = this.shiftDown(index);
                if (temp === index) break;
                else index = temp;
            }
        }

        //堆排序
        heapSort() {
            while (this.heapSize > 1) {
                this.swapNum(0, this.heapSize - 1);
                this.heapSize -= 1;
                let index = 0;
                while (1) {
                    let temp = this.shiftDown(index);
                    if (temp === index) break;
                    else index = temp;
                }
            }
            this.heapSize = this.heap.length;
        }

        //上浮操作 - 将当前节点与父节点进行比较，如果该节点值大于父节点值，则进行交换。
        shiftUp(index) {
            let parent = Math.ceil(index / 2) - 1;
            if (this.heap[index] > this.heap[parent] && parent >= 0) {
                this.swapNum(index, parent);
                return parent;
            }
            return -1;
        }

        // 下沉操作 - 将当前节点与左右子节点进行比较，如果该节点值不是最大，则进行交换
        shiftDown(index) {
            let left = Math.floor(index * 2) + 1;
            let right = left + 1;
            let largest = index;
            if (left < this.heapSize && this.heap[left] > this.heap[largest]) largest = left;
            if (right < this.heapSize && this.heap[right] > this.heap[largest]) largest = right;
            if (largest !== index) {
                this.swapNum(index, largest);
            }
            return largest;
        }

    }
```

在**Python**中，优先队列可以通过**queue**模块实现

```python
    from queue import Queue   # 队列，FIFO
    from queue import PriorityQueue  #优先级队列，优先级高的先输出，默认最小优先

    ###############队列（Queue）的使用###############
    q = Queue(maxsize) 	#构建一个队列对象，maxsize初始化默认为零，此时队列无穷大
    q.empty()		    #判断队列是否为空(取数据之前要判断一下)  return boolean
    q.full()		    #判断队列是否满了  return boolean
    q.put()			    #向队列存放数据
    q.get()			    #从队列取数据
    q.qsize()		    #获取队列大小，可用于判断是否满/空

    ###用法示例：
    >>> q = Queue(3)
    >>> for i in range(3):
    >>>	q.put(i)
    >>> q.full()
    True
    >>> while not q.empty():
    >>> 	print(q.get())
    0
    1
    2
    ###############优先队列（PriorityQueue）的使用###############
    """
    队列的变体，按优先级顺序（最低优先）删除队内元素（出队）。
    元素通常是(priority number, data)格式的元组：
    插入格式：q.put((priority number, data))
    特点：priority number 越小，优先级越高

    其他的操作和队列相同
    """
    >>> q = PriorityQueue()
    >>> q.put((2, "Lisa"))
    >>> q.put((1, "Lucy"))
    >>> q.put((0, "Tom"))
    >>> i = 0
    >>> while i < q.qsize():
    >>> 	print(q.get())
    (0, "Tom")
    (1, "Lucy")
    (2, "Lisa")
```

在**JavaScript**中，优先队列可以通过**datastructures-js/priority-queue**库实现

```javascript
    import { PriorityQueue } from '@datastructures-js/priority-queue';

    const minHeap = new PriorityQueue({ compare: (a, b) => a - b }); // 从小到大排序，创建最小堆/最小优先队列
    const maxHeap = new PriorityQueue({ compare: (a, b) => b - a }); // 从大到小排序，创建最大堆/最大优先队列

    const pq = new PriorityQueue({ compare: (a, b) => a - b }); // 最小优先队列
    pq.enqueue(10); // 将 10 添加到队列中
    const highestPriority = pq.dequeue(); // 移除并返回优先级最高的元素
    const highestPriority = pq.front(); // 访问优先级最高的元素，但不移除
    console.log(pq.size()); // 输出队列中元素的数量
    pq.clear(); // 清空队列
    pq.isEmpty(); // 判断队列是否为空 return boolean
```

### Topk问题

> ##### TIP
>
> **Topk最大**用**size为k**的**最小**优先队列/**小根**堆，新元素**大于队头/堆顶**时，弹出队头/堆顶并将新元素插入最小优先队列/小根堆  
> **Topk最小**用**size为k**的**最大**优先队列/**大根**堆，新元素**小于队头/堆顶**时，弹出队头/堆顶并将新元素插入最大优先队列/大根堆  
> 也可以用**堆排序**思路：`CreateHeapFromArray(nums)`=>`swap(0, heapsize-1)`=>`heapsize-=1`=>`heapify(0)`，重复k次，原数组倒数第k个元素即为Topk最大/最小元素
{: .block-tip }

#### LeetCode 215.数组中的第K个最大元素[<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="2 -5 24 24" width="24px" fill="#4B77D1"><g><rect fill="none" height="24" width="24"/></g><g><polygon points="6,6 6,8 14.59,8 5,17.59 6.41,19 16,9.41 16,18 18,18 18,6"/></g></svg>](https://leetcode-cn.com/problems/kth-largest-element-in-an-array/)

**题目描述**：给定一个整数数组`nums`和一个整数`k`,请返回数组中第`k`个最大的元素。

请注意，你需要找的是数组排序后的第`k`个最大的元素，而不是第`k`个不同的元素。

你必须设计并实现时间复杂度为`O(n)`的算法解决此问题。

**示例 1**

*   输入：`nums = [3,2,1,5,6,4], k = 2`
*   输出：`5`

**示例 2**

*   输入：`nums = [3,2,3,1,2,4,5,5,6], k = 4`
*   输出：`4`

**提示**

*   <code>1 <= k <= nums.length <= 10<sup>5</sup></code>
*   <code>-10<sup>4</sup> <= nums[i] <= 10<sup>4</sup></code>

**解决方案**

```typescript
    // 堆排序思路
    function findKthLargest(nums: number[], k: number): number {
        // 数组存储大根堆(完全二叉树)
        const heapify = (nums: number[], heapsize: number, index: number)=>{ 
            // 递归调整为大根堆，只用递归发生交换的孩子结点
            let largest_index = index
            const left_index = index*2+1
            const right_index = index*2+2
            if(left_index<heapsize && nums[left_index]>nums[largest_index]){
                largest_index = left_index
            }
            if(right_index<heapsize && nums[right_index]>nums[largest_index]){
                largest_index = right_index
            }
            if(largest_index!=index){
                [nums[index], nums[largest_index]] = [nums[largest_index], nums[index]]
                heapify(nums, heapsize, largest_index)
            }
        }
        const n = nums.length
        for(let i = Math.floor(n/2-1);i>=0;i--){ 
            // 从最后一个非叶子节点开始构建最大堆
            // 完全二叉树：leaf = node1 + node2(n为偶数) or leaf = node1 + node2 + 1(n为奇数)
            heapify(nums, n, i)
        }
        for(let i = n-1;i>=n-k;i--){ 
            // 每次将大根移动到最后，并将heapsize-1，循环k次后，倒数第k个元素即为第k大元素
            [nums[0], nums[i]] = [nums[i], nums[0]]
            heapify(nums, i, 0)
        }
        return nums[n-k]
    };
```

#### LeetCode 347.前K个高频元素[<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="2 -5 24 24" width="24px" fill="#4B77D1"><g><rect fill="none" height="24" width="24"/></g><g><polygon points="6,6 6,8 14.59,8 5,17.59 6.41,19 16,9.41 16,18 18,18 18,6"/></g></svg>](https://leetcode-cn.com/problems/top-k-frequent-elements/)

**题目描述**：给你一个整数数组`nums`和一个整数`k`，请你返回其中出现频率前`k`高的元素。你可以按**任意顺序**返回答案。

**示例 1**

*   输入：`nums = [1,1,1,2,2,3], k = 2`
*   输出：`[1,2]`

**示例 2**

*   输入：`nums = [1], k = 1`
*   输出：`[1]`

**提示**

*   <code>1 <= nums.length <= 10<sup>5</sup></code>
*   `k`的取值范围是`[1, 数组中不相同的元素的个数]`
*   题目数据保证答案唯一，换句话说，数组中前`k`个高频元素的集合是唯一的

**解决方案**

```python
    // K-size遍历比较思路
    class Solution:
        def topKFrequent(self, nums: List[int], k: int) -> List[int]:
            hashtable = {}
            for num in nums:
                hashtable[num] = hashtable.get(num, 0) + 1
            nums_with_freq = list(zip(hashtable.values(), hashtable.keys()))
            from queue import PriorityQueue
            q = PriorityQueue(k)
            for item in nums_with_freq:
                if not q.full():
                    q.put(item)
                else:
                    temp = q.get()
                    q.put(max(item,temp,key=lambda x:x[0]))
            
            ans = []
            while not q.empty():
                ans.append(q.get()[1])

            return ans
```

### 合并K个排序链表
