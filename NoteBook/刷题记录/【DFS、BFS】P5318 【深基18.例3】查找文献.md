---
知识点:
  - DFS
  - BFS
题目链接: https://www.luogu.com.cn/problem/P5318
难度(洛谷): 普及−
模板:
  - 非递归深搜广搜
---
# 问题分析：

题目说的很直白，先根据数据建立起图（**需要排序**），然后再进行深搜和广搜并输出路径。
# 我的做法：

题目既然要求排序，那么就可以直接用最小优先队列来建立邻接表，并用一个布尔类型的`vis`数组来记录访问，即：

```cpp
bool vis[100005];
priority_queue<int,vector<int>,greater<int>> cts[100005];
```

对于深搜，用最简单的递归实现：

```cpp
void dfs(int x) {
	cout << x << " ";
	if (cts[x].empty())return;
	auto q = cts[x];
	while (!q.empty()) {
		int nx = q.top();
		if (!vis[nx]) {
			vis[nx] = true;
			dfs(nx);
		}
		q.pop();
	}
}
```

执行完深搜之后执行一次`memset(vis,0,sizeof(vis))`来重置`vis`数组，然后广搜可以采用[[【BFS】P1443 马的遍历#^537865|P1443]]的实现方法，即利用队列FIFO的特性来实现广搜，即：

```cpp
void bfs() {
	queue<int> q;
	q.push(1);
	while (!q.empty()) {
		int x = q.front();
		auto qq = cts[x];
		while (!qq.empty()) {
			int nx = qq.top();
			if (!vis[nx]) {
				vis[nx] = true;
				q.push(nx);
			}
			qq.pop();
		}
		cout << x<<" ";
		q.pop();
	}
}
```

这样做自然是可以通过这道题的，可是由于调用拷贝函数对优先队列进行了多次拷贝（每层递归都会），的这段代码的空间消耗高达`48.8MB`，如果题目限制更加严格一点的话，肯定会爆`MLE`的。
# 优化：

首先我必须要说明一下使用优先队列为什么要进行拷贝：**在C++中，为了确保队列FIFO的特性不会被破坏，队列并没有提供`begin()`和`end()`，所以我们不能通过迭代器来访问中间元素。如果要操作队首第二个元素，必须先令队首元素出队。而出队会丢失数据，为了确保数据的完整性，拷贝一个临时对象进行操作才是安全的。**

由于不能直接安全地遍历队列，所以需要拷贝，并且如果递归层数过深（如单链图），可能会导致栈溢出。

所以优化的思路就很明确了：
1. **使用非递归DFS避免栈溢出；**
2. **使用`vector`代替来规避拷贝开销。**

首先，如果要使用`vector`来建立邻接表的话，排序操作就得我们自己来做的，直接用`sort`函数就行；然后，就是非递归的DFS的实现，先贴代码：

```cpp
void dfs() {
	stack<int> st;
	st.push(1);
	vis[1] = true;
	cout << 1 << " ";
	while (!st.empty()) {
		int x = st.top();
		int i = 0;
		while (i < cts[x].size() && vis[cts[x][i]])i++;
		if (i < cts[x].size()) {
			int nx = cts[x][i];
			st.push(nx);
			vis[nx] = true;
			cout << nx << " ";
		}
		else {
			st.pop();
		}
	}
	cout << endl;
}
```

栈的特性是FILO，在`while`循环中，我们每次会寻找与栈顶元素相连的第一个未访问的元素，**在找到这个元素之后，这个元素入栈，成为了新的栈顶元素，这样一来下一次循环就会围绕这个新的栈顶元素进行**，以此类推层层递进。
如果找不到与栈顶相连的元素，那么就令栈顶元素出栈（回溯），回到上一层继续寻找。这样就**用栈模拟了一个递归操作**。
# 优化后的完整代码：

```cpp
#include <bits/stdc++.h>
using namespace std;
int n, m;
bool vis[100005];
vector<int> cts[100005];
void bfs() {
	queue<int> q;
	q.push(1);
	vis[1] = true;
	while (!q.empty()) {
		int x = q.front();
		for (int nx : cts[x]) {
			if (!vis[nx]) {
				q.push(nx);
				vis[nx] = true;
			}
		}
		cout << x << " ";
		q.pop();
	}
	cout << endl;
}
void dfs() {
	stack<int> st;
	st.push(1);
	vis[1] = true;
	cout << 1 << " ";
	while (!st.empty()) {
		int x = st.top();
		//寻找第一个未访问的相连元素
		int i = 0;
		while (i < cts[x].size() && vis[cts[x][i]])i++;
		if (i < cts[x].size()) {
			int nx = cts[x][i];
			st.push(nx);
			vis[nx] = true;
			cout << nx << " ";
		}
		else {
			st.pop();
		}
	}
	cout << endl;
}
int main() {
	cin >> n >> m;
	for (int i = 1; i <= m; i++) {
		int x, y;
		cin >> x >> y;
		cts[x].push_back(y);
	}
	//手动排序
	for (int i = 1; i <= n; i++) {
		sort(cts[i].begin(), cts[i].end());
	}
	dfs();
	//重置vis数组
	memset(vis, 0, sizeof(vis));
	bfs();
}
```