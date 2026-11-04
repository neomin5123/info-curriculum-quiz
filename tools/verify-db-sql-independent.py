import sqlite3, json, struct
c=sqlite3.connect(':memory:');c.execute('PRAGMA foreign_keys=ON')
checks=[]
def ck(label,actual,expected):
 assert actual==expected,(label,actual,expected)
 checks.append(dict(label=label,result=actual))
# 2014 A8
c.executescript('''CREATE TABLE customers(id INTEGER PRIMARY KEY,addr TEXT);CREATE TABLE orders(ord TEXT,price INT,id INT);''')
c.executemany('INSERT INTO customers VALUES(?,?)',[(1,'서울'),(2,'부산'),(3,'서울'),(4,'광주'),(5,'서울'),(6,'인천'),(7,'부산'),(8,'서울')])
c.executemany('INSERT INTO orders VALUES(?,?,?)',[('A1',20000,1),('A2',15000,3),('A3',34000,2),('A4',45000,5),('A5',12000,1),('A6',17000,4),('A7',24000,6),('A8',10000,3)])
ck('2014-A-08 join/group',c.execute("SELECT c.id,SUM(o.price) FROM customers c JOIN orders o ON c.id=o.id WHERE c.addr='서울' GROUP BY c.id").fetchall(),[(1,32000),(3,25000),(5,45000)])
# 2016 A08 view group having
c.executescript('CREATE TABLE emp(eno INT,salary INT,dno INT);CREATE TABLE dept(dno INT,name TEXT);')
c.executemany('INSERT INTO emp VALUES(?,?,?)',[(12,30000,5),(33,40000,5),(98,43000,1),(77,25000,4),(88,55000,1)])
c.executemany('INSERT INTO dept VALUES(?,?)',[(5,'연구부'),(4,'행정부'),(1,'인사부')])
ck('2016-A-08 having avg',c.execute('SELECT e.dno,d.name,SUM(e.salary) FROM emp e JOIN dept d ON e.dno=d.dno GROUP BY e.dno,d.name HAVING AVG(e.salary)>=40000').fetchall(),[(1,'인사부',98000)])
# 2017 B03 student grouped
c.executescript('CREATE TABLE student(num INT,name TEXT,score INT,dep INT);CREATE TABLE department(dep INT,name TEXT);')
c.executemany('INSERT INTO student VALUES(?,?,?,?)',[(100,'김수아',80,2),(200,'정상우',70,1),(300,'이민구',80,1),(400,'박정현',85,2),(500,'신지수',90,2)])
c.executemany('INSERT INTO department VALUES(?,?)',[(1,'국어교육'),(2,'컴퓨터교육'),(3,'수학교육')])
ck('2017-B-03 group SQL',c.execute('SELECT dep,AVG(score),MAX(score) FROM student GROUP BY dep ORDER BY AVG(score) DESC').fetchall(),[(2,85.,90),(1,75.,80)])
ck('2017-B-03 correlated SQL',c.execute('SELECT s.name,d.name,s.score FROM student s,department d WHERE score > (SELECT AVG(score) FROM student WHERE dep=s.dep) AND s.dep=d.dep ORDER BY s.num').fetchall(),[('이민구','국어교육',80),('신지수','컴퓨터교육',90)])
# 2019 A05 enrolled students excluding
c.executescript('CREATE TABLE users(id INT PRIMARY KEY);CREATE TABLE enroll(student_id INT,course_id INT);')
c.executemany('INSERT INTO users VALUES(?)',[(110001,),(131005,),(140103,),(142003,),(152126,)])
c.executemany('INSERT INTO enroll VALUES(?,?)',[(140103,534305),(152126,534305)])
ck('2019-A-05 NOT IN count',c.execute('SELECT COUNT(*) FROM users WHERE id NOT IN (SELECT student_id FROM enroll WHERE course_id=534305)').fetchone()[0],3)
# 2020 B02 aggregate grouping
c.executescript('CREATE TABLE product(id INT,price INT,company INT);')
c.executemany('INSERT INTO product VALUES(?,?,?)',[(1001,100,10),(1002,400,20),(1003,100,10),(1004,300,10),(1005,200,30),(1006,200,30),(1007,500,20),(1008,900,10)])
# original source: company 10 avg 350, 20 avg 450, 30 avg 200
ck('2020-B-02 HAVING groups',c.execute('SELECT company,AVG(price) FROM product GROUP BY company HAVING AVG(price)>300 ORDER BY company').fetchall(),[(10,350.),(20,450.)])
# 2021 B09 cascade and no action isolated scenarios
c.executescript('CREATE TABLE club(code TEXT PRIMARY KEY); CREATE TABLE joinclub(employee INT,code TEXT, FOREIGN KEY(code) REFERENCES club(code) ON DELETE CASCADE ON UPDATE NO ACTION);')
c.executemany('INSERT INTO club VALUES(?)',[('D1',),('D2',),('D3',)])
c.executemany('INSERT INTO joinclub VALUES(?,?)',[(1,'D1'),(2,'D2'),(2,'D3'),(3,'D1'),(3,'D2'),(4,'D1'),(4,'D2'),(4,'D3'),(5,'D2'),(5,'D3'),(6,'D3')])
c.execute("DELETE FROM club WHERE code='D2'")
ck('2021-B-09 delete cascade count',c.execute('SELECT COUNT(*) FROM joinclub').fetchone()[0],7)
try:c.execute("UPDATE club SET code='D4' WHERE code='D3'");raise AssertionError('should reject')
except sqlite3.IntegrityError:pass
ck('2021-B-09 D4 reference count',c.execute("SELECT COUNT(*) FROM joinclub WHERE code='D4'").fetchone()[0],0)
# 2024 A09 float representation
ck('2024-A-09 IEEE (1.011)',format(struct.unpack('>I',struct.pack('>f',1.375))[0],'032b'),'0'+'01111111'+'01100000000000000000000')
ck('2024-A-09 IEEE (10.1)',format(struct.unpack('>I',struct.pack('>f',2.5))[0],'032b'),'0'+'10000000'+'01000000000000000000000')
ck('2024-A-09 IEEE product',format(struct.unpack('>I',struct.pack('>f',1.375*2.5))[0],'032b'),'0'+'10000000'+'10111000000000000000000')
# 2025 A10 update only inaccessible video, retaining video table
c.executescript('CREATE TABLE video(id INT PRIMARY KEY,active TEXT);CREATE TABLE service(id INT,video_id INT,refund TEXT, FOREIGN KEY(video_id) REFERENCES video(id));')
c.executemany('INSERT INTO video VALUES(?,?)',[(101,'T'),(102,'F'),(201,'T'),(202,'F')])
c.executemany('INSERT INTO service VALUES(?,?,?)',[(1004,101,'F'),(1005,102,'F'),(1006,202,'F')])
c.execute("UPDATE service SET refund='T' WHERE refund='F' AND video_id IN (SELECT id FROM video WHERE active='F')")
ck('2025-A-10 UPDATE refund statuses',c.execute('SELECT id,refund FROM service ORDER BY id').fetchall(),[(1004,'F'),(1005,'T'),(1006,'T')])
print(json.dumps({'status':'PASS','verifiedSqlAndIEEECases':checks},ensure_ascii=False,indent=2))
