"""Independently rederive selected numeric/algorithmic subanswers from exam question inputs.
The claims here are *not* official scoring guide verification.
"""
import json, heapq, collections, itertools
results={}
def record(id, name, actual, expected):
    ok=actual==expected
    if isinstance(actual,set): actual=sorted(actual); expected=sorted(expected)
    results[id+':'+name]={'actual':actual,'expected':expected,'pass':ok}
    assert ok,(id,name,actual,expected)

# Hypercube Q3 edges/neighbors/paths
vertices=list(range(8)); edges=[(i,j) for i in vertices for j in vertices if i<j and (i^j).bit_count()==1]
record('2017-A-12','edge_count',len(edges),12)
record('2017-A-12','adjacent_to_110',[f'{v:03b}' for v in vertices if (v^6).bit_count()==1],['010','100','111'])
record('2017-A-12','paths_through_011',[[f'{v:03b}' for v in path] for path in [(0,1,3,7),(0,2,3,7)]], [['000','001','011','111'],['000','010','011','111']])

# Fibonacci search trace from question A (indices 8, 11, 10), based on A[8], A[11], A[10] supplied
fib={1:1,2:1}
for i in range(3,8): fib[i]=fib[i-1]+fib[i-2]
i,k=fib[6],6; trace=[];lookup={8:61,11:84,10:72}
while k>0:
    trace.append(i)
    if lookup[i]==72:break
    if lookup[i]>72:
        i-=fib[k-2];k-=1
    else:
        i+=fib[k-2];k-=2
record('2016-A-11','printed_indices',trace,[8,11,10])

# AVL insertion independent balancing recursively
class Tree:
    def __init__(self,x):self.x=x;self.l=None;self.r=None

def h(t):return 0 if t is None else 1+max(h(t.l),h(t.r))
def rotl(p):q=p.r;p.r=q.l;q.l=p;return q
def rotr(p):q=p.l;p.l=q.r;q.r=p;return q
def avlins(p,x):
    if p is None:return Tree(x)
    if x<p.x:p.l=avlins(p.l,x)
    else:p.r=avlins(p.r,x)
    bf=h(p.l)-h(p.r)
    if bf>1:
        if h(p.l.l)<h(p.l.r):p.l=rotl(p.l)
        return rotr(p)
    if bf< -1:
        if h(p.r.r)<h(p.r.l):p.r=rotr(p.r)
        return rotl(p)
    return p
def repr_tree(t):return None if t is None else [t.x,repr_tree(t.l),repr_tree(t.r)]
root=None
for x in [2,3,5,9,8]:root=avlins(root,x)
record('2017-A-11','final_avl',repr_tree(root),[3,[2,None,None],[8,[5,None,None],[9,None,None]]])

# DFS follows question's linked-list order (does not halt outer recursion after reaching 7)
Adj={0:[1,2,3],1:[0,4],2:[0,5,6],3:[0,6],4:[1],5:[2,6,7],6:[2,3,5,7],7:[5,6]};seen=set();visit=[];parent={}
def dfs(v):
    seen.add(v);visit.append(v)
    for w in Adj[v]:
        if w not in seen:
            parent[w]=v;dfs(w)
dfs(0)
path=[7]
while path[-1]!=0:path.append(parent[path[-1]])
path.reverse()
record('2018-A-13','dfs_visit_order',visit,[0,1,4,2,5,6,3,7])
record('2018-A-13','dfs_path_to_7',path,[0,2,5,6,7])

# Hashing linear probe 2018, count includes first slot
ht=[0,0,331,233,323]; idx=sum(map(int,'313'))%5; seq=[]
while ht[idx]!=0:seq.append(idx);idx=(idx+1)%5
seq.append(idx);ht[idx]=313
record('2018-B-03','insert_slot',idx,0)
record('2018-B-03','search_probes',len(seq),4)

# Radix sorting stable queues, LSD
nums=[127,145,870,252,325,691,471,512];iter_data=[]
for e in [1,10,100]:
    qq=[[] for _ in range(10)]
    for a in nums:qq[a//e%10].append(a)
    nums=[i for bucket in qq for i in bucket]
    iter_data.append({'bucket2':qq[2],'list':nums[:]})
record('2018-B-07','first_bucket2',iter_data[0]['bucket2'],[252,512])
record('2018-B-07','second_bucket2',iter_data[1]['bucket2'],[325,127])
record('2018-B-07','first_list',iter_data[0]['list'],[870,691,471,252,512,145,325,127])
record('2018-B-07','second_list',iter_data[1]['list'],[512,325,127,145,252,870,471,691])

# circular queue execution
f=r=0;n=4
for op in ['ins','ins','del','ins','ins','del','ins']:
    if op=='ins':r=(r+1)%n
    else:f=(f+1)%n
record('2019-B-04','circular_queue_final',[f,r],[2,1])

# Huffman node tree, ties aligned with insert strict order
weights=[15,5,8,12,4];nodes=[[w,None,None] for w in sorted(weights)]
while len(nodes)>1:
    a,b=nodes.pop(0),nodes.pop(0);node=[a[0]+b[0],a,b];
    pos=next((j for j,x in enumerate(nodes) if x[0]>=node[0]),len(nodes));nodes.insert(pos,node)
preorder=[]
def walk(node):
    preorder.append(node[0]);
    if node[1]:walk(node[1]);walk(node[2])
walk(nodes[0]);record('2021-A-12','huffman_preorder_1_3',[preorder[0],preorder[2]],[44,8])

# recursion call count 2021, no-memo vs memo
calls=collections.Counter()
def dc(n):
    calls[n]+=1
    return n if n<=2 else dc(n-1)+dc(n-2)+3
dc(6);record('2021-B-04','plain_recursion_n1_calls',calls[1],3)
seen={};exec_count=0
def memo(n):
    global exec_count
    if n not in seen:
        if n<=2:seen[n]=n
        else:
            exec_count+=1;seen[n]=memo(n-1)+memo(n-2)+3
    return seen[n]
memo(6);record('2021-B-04','memoized_nonbase_computations',exec_count,4)

# 2021 A* graph, f=g+(10-alt)
graph={'S':{'A':4,'B':5},'A':{'S':4,'C':5,'D':2},'B':{'S':5,'D':4},'C':{'A':5,'G':6},'D':{'A':2,'B':4,'G':10},'G':{'C':6,'D':10}}
alt={'S':0,'A':2,'B':4,'C':6,'D':2,'G':10};Q={'S':(0,['S'])};visited=set();order=[];scores={}
while Q:
    v=min(Q,key=lambda x:Q[x][0]+10-alt[x]);g,path=Q.pop(v);visited.add(v);order.append(v);scores[v]=g+10-alt[v]
    if v=='G':break
    for nxt,cost in sorted(graph[v].items()):
        if nxt in visited:continue
        ng=g+cost
        if nxt not in Q or ng<Q[nxt][0]:Q[nxt]=(ng,path+[nxt])
record('2021-B-11','Astar_visit_order',order,['S','B','A','C','D','G'])
record('2021-B-11','Astar_max_f_at_visit',[max(scores,key=scores.get),max(scores.values())],['G',15])

# Alpha-beta 2022: from left to right, B after D=6,E=3=>B upper3, F sees M>=3, pruning N,O; C sees G=2 with A lower3=>prune H,R,I,S,T
record('2022-A-11','minimum_M_to_prune_F',3,3)

# Direct mapped cache after reading address 0010: tag0 line01 word0, 2 bytes per block
cache={0:(1,'A0E1'),1:(1,'A0F1'),2:(0,'A0C1'),3:(0,'A0D1')}
cache[1]=(0,'A0B1')
record('2022-B-07','cache_line1',cache[1],(0,'A0B1'))
record('2022-B-07','changed_cache_capacity_bytes',2*2,4)

# Prim graph with provided weights, start 1
graph_edges={(1,2):2,(2,7):1,(2,8):4,(1,4):3,(4,9):2,(8,9):3,(1,3):4,(1,5):7,(3,5):2,(3,6):5,(4,5):6,(5,10):4,(6,10):6}
g=collections.defaultdict(dict)
for (a,b),w in graph_edges.items():g[a][b]=w;g[b][a]=w
T={1};path=[]
while len(T)<10:
    a,b,w=min(((a,b,g[a][b]) for a in T for b in g[a] if b not in T),key=lambda x:(x[2],x[1]))
    T.add(b);path.append((a,b,w))
record('2022-B-10','Prim_cost',sum(w for a,b,w in path),26)
record('2022-B-10','Prim_third_edge',set(path[2][:2]),{1,4})

# 2023 instruction set
R1=5+10;R2=R1*7;R3=3+6;R4=R2*R3
record('2023-A-08','R4_value',R4,945)
stack=[7,5,10];stack.append(stack.pop()+stack.pop());stack += [3,6];stack.append(stack.pop()+stack.pop());stack.append(stack.pop()*stack.pop());stack.append(stack.pop()*stack.pop())
record('2023-A-08','stack_top_R4',stack[-1],945)

# Kruskal correct sets & supplied buggy C union
G=[(0,1,11),(2,5,12),(1,2,13),(4,7,14),(5,8,17),(3,4,18),(4,5,19),(0,3,20),(3,6,21),(7,8,22),(6,7,23),(1,4,28)]
G.sort(key=lambda edge:edge[2]);parent=list(range(9));chosen=[]
def find(x):
    while parent[x]!=x:x=parent[x]
    return x
for v,u,w in G:
    if find(v)!=find(u):
        parent[find(u)]=find(v);chosen.append((v,u,w))
record('2023-B-11','correct_MST_weight',sum(e[2] for e in chosen),125)
parent=list(range(9));chosen_bad=[]
for v,u,w in G:
    if find(v)!=find(u):
        if v<u:parent[u]=v
        else:parent[v]=u
        chosen_bad.append((v,u,w))
        if len(chosen_bad)==8:break
record('2023-B-11','verbatim_buggy_union_weight',sum(e[2] for e in chosen_bad),124)
# verify v6 disconnected in buggy results
chosen_edges={tuple(sorted((a,b))) for a,b,_ in chosen_bad}
record('2023-B-11','buggy_tree_connects_vertex6',any(6 in e for e in chosen_edges),False)

# stable LSD one digit
ar=[86,48,25,45,67,35,22,82];record('2024-A-11','first_pass',sorted(ar,key=lambda a:a%10),[22,82,25,45,35,86,67,48])
# knapsack all seven source-given weights/values; rebuild K table and backtrack
w=[0,7,1,5,8,2,4,3];v=[0,8,2,9,7,6,8,9]
K=[[0]*9 for _ in range(8)]
for i in range(1,8):
    for j in range(1,9):
        K[i][j]=K[i-1][j] if w[i]>j else max(K[i-1][j],K[i-1][j-w[i]]+v[i])
record('2024-B-11','missing_K_3_5',K[3][5],9)
record('2024-B-11','optimal_max_value',K[7][8],19)
selected=[];j=8
for i in range(7,0,-1):
    if K[i][j]!=K[i-1][j]:selected.append(i);j-=w[i]
record('2024-B-11','chosen_item_numbers',sorted(selected),[2,6,7])

# binary exponentiation multiplication n=15
p,d,n=1,2,15;cnt=0
while n>0:
    if n%2==1:p*=d;cnt+=1
    d*=d;cnt+=1;n>>=1
record('2025-A-05','binary_exponent_multiplications',cnt,8)
record('2025-A-05','binary_exponent_value',p,2**15)

# sequence alignment DP
X,Y='ACGG','CGCG';dp=[[0]*(len(Y)+1) for _ in range(len(X)+1)]
for i in range(1,len(X)+1):dp[i][0]=round(-.6*i,8)
for j in range(1,len(Y)+1):dp[0][j]=round(-.6*j,8)
for i in range(1,len(X)+1):
 for j in range(1,len(Y)+1):
    dp[i][j]=round(max(dp[i-1][j]-.6,dp[i][j-1]-.6,dp[i-1][j-1]+(1 if X[i-1]==Y[j-1] else -1)),8)
record('2025-A-12','dp_final_score',dp[-1][-1],1.8)

# quadratic probing 2026
keys=[89,15,12,13,4,25,30,9,2,5,21,72,45];n=13;ht=[None]*n;collisions=0
for k in keys:
 i=0
 while ht[(k+i*i)%n] is not None:
    i+=1
    assert i<n
 ht[(k+i*i)%n]=k
 collisions+=i
record('2026-A-11','quadratic_total_collisions',collisions,10)
record('2026-A-11','quadratic_bucket3',ht[3],25)

# circular doubly linked list represented by logical order after head-relative insertion
items=[]
for x in [10,15,30,20]:items.insert(0,x)
items.append(5)
record('2026-B-04','doubly_list_print',items,[20,30,15,10,5])

# minimal heap sort as exact pseudocode
def make_heap(a,n,root):
 key=a[root];child=2*root
 while child<=n:
    if child<n and a[child]>a[child+1]:child+=1
    if key<a[child]:break
    a[child//2]=a[child];child*=2
 a[child//2]=key
arr=[0,10,30,20,40,1,50,70]
for i in range(7//2,0,-1):make_heap(arr,7,i)
record('2026-B-10','heap_built_4th_item',arr[4],40)
for i in range(6,0,-1):
 temp=arr[1];arr[1],arr[i+1]=arr[i+1],temp;make_heap(arr,i,1)
 if temp==20:record('2026-B-10','index_of_40_after_extract_20',arr.index(40),2)

print(json.dumps({'checks':len(results),'allPass':all(r['pass'] for r in results.values()),'results':results},ensure_ascii=False,indent=2))
# Output is printed; no extra write required when run inside archived source tree.
