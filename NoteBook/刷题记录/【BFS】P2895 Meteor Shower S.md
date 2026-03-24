---
知识点:
  - BFS
题目链接: https://www.luogu.com.cn/problem/P2895
难度(洛谷): 普及/提高−
---
# 问题分析（瞎子传奇之寻找眼珠子）：

图的最短路问题，那当然是BFS了。所以我的思路是，**把每个位置的最早被击中时间标记出来，然后在标准BFS的剪枝逻辑中加入当前时间与最早被击中时间的比较即可**，所以我创建了一个`bs`数组用来存储最早的击中时间，处理逻辑我是这么写的：

```cpp
memset(bs, -1, sizeof(bs));
for (int i = 1; i <= m; i++) {
	int x, y, t; cin >> x >> y >> t;
	bs[x][y] = t;//看我看我，我好像缺了点啥⊙(・◇・)？
	for (int j = 0; j < 4; j++) {
		int nx = x + ds[j][0], ny = y + ds[j][1];
		if (nx < 0 || nx>300 || ny < 0 || ny>300)continue;
		if (bs[nx][ny] == -1 || t < bs[nx][ny]) bs[nx][ny] = t;
	}
}
```

是的，**我只给四周的位置加了最早的判断，却忘记了给中心加上（我在干什么？）**，最终还是在D老师的帮助下才发现了问题。倒也很好改，只要把第4行改一下就行了：

```cpp
if (bs[x][y] == -1 || t < bs[x][y]) bs[x][y] = t;
```

再写一下BFS的模板，就大功告成了：

```cpp
q.push(make_pair(0, 0)); vs[0][0] = true; ns[0][0] = 0;
while (!q.empty()) {
	int x = q.front().first, y = q.front().second;
	if (bs[x][y] == -1) {
		cout << ns[x][y]; 
		break;
	}
	for (int i = 0; i < 4; i++) {
		int nx = x + ds[i][0], ny = y + ds[i][1];
		if (vs[nx][ny] || (nx < 0 || nx>300 || ny < 0 || ny>300)||
			(bs[nx][ny]!=-1&&ns[x][y]+1>=bs[nx][ny]))continue;
		q.push(make_pair(nx, ny)); 
		vs[nx][ny] = true; 
		ns[nx][ny] = ns[x][y] + 1;
	}
	q.pop();
}
if (q.empty())cout << -1;
```

好，提交……最后一个50000个测试数据的报了`WA`…

50000个数据啊，我总不能一个一个看吧？我看了一下正确答案，是459，然后用我的代码跑了一遍，发现我的代码认为根本找不到安全区域（输出了-1）？然后啊，D老师说让我把上界限制给删了（也就是`nx>300`和`ny>300`），删了之后还真对了，为啥啊？然后我回去看了一下原题，**原题的意思是：流星只会落在300以内的坐标上，而地图范围是整个直角坐标系……**
# 完整代码：

```cpp
#include <bits/stdc++.h>
using namespace std;
int m, ns[305][305],bs[305][305];
int ds[4][2] = { {-1,0},{1,0},{0,-1},{0,1} };
queue<pair<int, int>> q;
bool vs[305][305];
int main() {
	cin >> m;
	memset(ns, -1, sizeof(ns));
	memset(bs, -1, sizeof(bs));
	for (int i = 1; i <= m; i++) {
		int t, x, y; cin >> x >> y >> t;
		if (bs[x][y] == -1 || t < bs[x][y]) {
			bs[x][y] = t;
		}
		for (int j = 0; j < 4; j++) {
			int nx = x + ds[j][0], ny = y + ds[j][1];
			if (nx < 0 || ny < 0)continue;
			if (bs[nx][ny] == -1 || t < bs[nx][ny]) {
				bs[nx][ny] = t;
			}
		}
	}
	q.push(make_pair(0, 0)); vs[0][0] = true; ns[0][0] = 0;
	while (!q.empty()) {
		int x = q.front().first, y = q.front().second;
		if (bs[x][y] == -1) {
			cout << ns[x][y]; 
			break;
		}
		for (int i = 0; i < 4; i++) {
			int nx = x + ds[i][0], ny = y + ds[i][1];
			if (vs[nx][ny] || (nx < 0 || ny < 0)||
				(bs[nx][ny]!=-1 && ns[x][y]+1>=bs[nx][ny]))continue;
			q.push(make_pair(nx, ny)); 
			vs[nx][ny] = true; 
			ns[nx][ny] = ns[x][y] + 1;
		}
		q.pop();
	}
	if (q.empty())cout << -1;
}
```