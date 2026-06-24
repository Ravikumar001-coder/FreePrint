
## 🔹 UNIT 1: Architecture & Data Models

### 1. Three-Schema Architecture of DBMS

The Three-Schema Architecture separates the user applications from the physical database, establishing a standardized framework for data abstraction.

```
       [ End Users / Applications ]
                    │
        ┌───────────▼───────────┐
        │  EXTERNAL LEVEL       │  <-- View 1, View 2 ... View N
        └───────────┬───────────┘
                    │ (Logical Data Independence)
        ┌───────────▼───────────┐
        │  CONCEPTUAL LEVEL     │  <-- Global Logical Schema (Entities, FDs, Constraints)
        └───────────┬───────────┘
                    │ (Physical Data Independence)
        ┌───────────▼───────────┐
        │  INTERNAL LEVEL       │  <-- Physical Storage, B+ Trees, Slotted Pages
        └───────────┬───────────┘
                    │
            [( Physical DB )]

```

* **External Level (View Level):** Describes only the part of the database relevant to a specific user group, hiding the remaining schema.
* **Conceptual Level (Logical Level):** Describes what data is stored across the entire database and the relationships/integrity constraints among those data items.
* **Internal Level (Physical Level):** Describes how the data is physically stored on storage hardware (byte ordering, indexing, access paths).

---

### 2. Logical vs. Physical Data Independence

| Feature | Logical Data Independence | Physical Data Independence |
| --- | --- | --- |
| **Definition** | Ability to modify the **Conceptual Schema** without changing the External Schemas/Application programs. | Ability to modify the **Internal Schema** without changing the Conceptual or External Schemas. |
| **Operational Interface** | Occurs between the Conceptual and External levels. | Occurs between the Internal and Conceptual levels. |
| **Common Operations** | Adding/deleting entities, attributes, or relationships. | Changing file organization, switching from hashing to B+ Tree indexing, migrating hardware. |
| **Implementation Difficulty** | **Harder** to achieve because application logic is heavily coupled with logical data structures. | **Easier** to achieve; handled autonomously by the database storage engine. |

---

### 3. Entity, Attribute, and Relationship

* **Entity:** A distinct, real-world object or concept that exists independently (e.g., a specific student named "Ravi"). An **Entity Set** is a collection of entities of the same type (e.g., `STUDENT`).
* **Attribute:** A descriptive property or characteristic possessed by an entity set (e.g., `Roll_No`, `Name`, `CGPA`).
* **Relationship:** An association among several entities (e.g., a student "Enrolls" in a course). A **Relationship Set** is a mathematical relation $R \subseteq E_1 \times E_2 \times \dots \times E_n$.

---

### 4. Weak Entity Set and ER Representation

A **Weak Entity Set** is an entity set that does not possess sufficient attributes to form a primary key of its own. It depends entirely on the existence of an **Identifying Strong Entity Set** (Owner Entity).

* **Discriminator (Partial Key):** The set of attributes that uniquely identifies a weak entity within a specific owner entity instance.
* **ER Notation:** * Weak Entity Set: **Double Rectangle**.
* Identifying Relationship: **Double Diamond**.
* Partial Key: **Underlined with a dashed/dotted line**.



```
 ┌─────────────┐        ╔═════════════╗        ╔═════════════╗
 │    LOAN     │────────╣  repayment  ╠────────╣ INSTALLMENT ║
 └─────────────┘  (1,1) ╚═════════════╝ (0,N)  ╚═════════════╝
(Strong Entity)      (Identifying Rel)          (Weak Entity)

```

---

### 5. Generalization vs. Specialization

* **Specialization (Top-Down):** The process of taking a high-level entity set and breaking it down into lower-level sub-entity sets based on distinguishing characteristics (e.g., `ACCOUNT` specializes into `SAVINGS_ACC` and `CURRENT_ACC`).
* **Generalization (Bottom-Up):** The reverse process of synthesizing multiple lower-level entity sets that share common attributes into a single higher-level superclass entity set (e.g., `CAR` and `TRUCK` generalize into `VEHICLE`).
* **Constraints:**
* *Disjoint vs. Overlapping:* Disjoint ($d$) means an entity can belong to only one subclass. Overlapping ($o$) means it can belong to multiple subclasses simultaneously.
* *Total vs. Partial:* Total participation requires every superclass instance to belong to at least one subclass.



---

### 6. Types of Keys in DBMS

1. **Super Key:** Any set of attributes $K \subseteq R$ that can uniquely identify a tuple in a relation $R$.
2. **Candidate Key:** A **minimal** super key. A super key from which no attribute can be removed without destroying its uniqueness property.
3. **Primary Key:** One specific candidate key chosen autonomously by the database designer to identify tuples uniquely within the table.
4. **Alternate Key:** All remaining candidate keys that were not selected as the primary key.
5. **Foreign Key:** An attribute (or attribute set) inside one table that references the Primary Key of another table, enforcing referential integrity.

---

### 7. Entity Integrity and Referential Integrity

* **Entity Integrity:** Dictates that no core attribute participating in the **Primary Key** of a relation can accept a `NULL` value. *Reason:* If a primary key value is null, the storage engine cannot uniquely identify that specific row.
* **Referential Integrity:** Dictates that if a relation $R_1$ contains a foreign key referencing the primary key of relation $R_2$, then every value of the foreign key in $R_1$ must either match an existing primary key value in $R_2$ or be entirely `NULL`.

---

### 8. Role and Responsibilities of a DBA

The **Database Administrator (DBA)** exercises central control over both the data and the application programs accessing that data.

1. **Schema Definition:** Executing DDL statements to create the original logical schema.
2. **Storage Structure and Access Method Definition:** Defining optimal physical parameters (page sizes, indexing algorithms).
3. **Schema and Physical Organization Modification:** Restructuring tables or access paths to optimize performance based on shifting query workloads.
4. **Granting Authorization:** Implementing access-control models (RBAC/MAC/DAC) to secure the database against unauthorized access.
5. **Routine Maintenance:** Configuring automated backup routines, monitoring disk space, and managing system recovery operations following crashes.

---

### 9. Data Abstraction and its Levels

**Data Abstraction** is the conceptual process of hiding complex internal data storage and implementation details from end-users to simplify their interaction with the database. It is executed across three strict tiers: **Physical Level** (lowest level, describing byte-level data structures), **Logical Level** (middle level, describing database architecture via tables and data types), and **View Level** (highest level, exposing customized data subsets to specific users).

---

### 10. Comparison of Data Models

| Parameter | Hierarchical Model | Network Model | Relational Model |
| --- | --- | --- | --- |
| **Underlying Structure** | Tree structure (Parent-Child nodes). | Graph structure (Records and Links). | Flat two-dimensional Tables. |
| **Relationship Support** | Strictly $1:1$ or $1:N$. | Supports $M:N$ natively via link records. | Supports $1:1$, $1:N$, and $M:N$ (via junction tables). |
| **Data Independence** | Zero physical/logical independence. | Extremely low data independence. | **High** physical and logical independence. |
| **Query Flexibility** | Navigational; rigid procedural access. | Navigational; complex pointer tracking. | Declarative (`SELECT` queries based on relational algebra). |

---

---

## 🔹 UNIT 2: Relational Algebra, SQL & Normalization

### 11. Fundamental Operators of Relational Algebra

1. **Selection ($\sigma$):** Unary operator that returns a horizontal subset of tuples satisfying a specified predicate condition $P$.

$$\sigma_{\text{Salary} > 50000}(\text{Employee})$$


2. **Projection ($\pi$):** Unary operator that returns a vertical subset of the relation, outputting only specified attribute columns and automatically eliminating duplicate rows.

$$\pi_{\text{Name}, \text{Department}}(\text{Employee})$$


3. **Union ($\cup$):** Binary operator that combines tuples from two union-compatible relations $R$ and $S$ (same degree and identical domain types).

$$R \cup S$$


4. **Set Difference ($-$):** Binary operator that outputs tuples present in relation $R$ but strictly absent in relation $S$.

$$R - S$$


5. **Cartesian Product ($\times$):** Binary operator that combines every tuple of relation $R$ with every tuple of relation $S$. If $R$ has $n_1$ tuples and $S$ has $n_2$ tuples, the result yields $n_1 \times n_2$ tuples.

$$R \times S$$



---

### 12. Division Operator in Relational Algebra

The **Division Operator ($R \div S$)** is a derived binary operator utilized to answer queries containing universal quantification (e.g., "Find the entity that has performed *all* specified actions").

* **Mathematical Expansion:**

$$R \div S = \pi_{R-S}(R) - \pi_{R-S}\big((\pi_{R-S}(R) \times S) - R\big)$$


* **Example Narrative:** Find the names of sailors who have reserved *every* boat.

$$\text{Result} = \pi_{\text{Sailor\_ID}, \text{Boat\_ID}}(\text{Reserves}) \div \pi_{\text{Boat\_ID}}(\text{Boats})$$



---

### 13. Types of JOINs in SQL

1. **Inner Join:** Returns rows where there is at least one match in both tables based on the join predicate.
2. **Left (Outer) Join:** Returns all rows from the left table, and the matched rows from the right table. Unmatched right-side attributes are populated with `NULL`.
3. **Right (Outer) Join:** Returns all rows from the right table, and the matched rows from the left table.
4. **Full (Outer) Join:** Returns all rows when there is a match in either the left or the right table.
5. **Cross Join:** Produces the explicit Cartesian product of both tables without applying any filtering predicate.

---

### 14. DROP vs. DELETE vs. TRUNCATE

| Parameter | `DELETE` | `TRUNCATE` | `DROP` |
| --- | --- | --- | --- |
| **Command Type** | DML (Data Manipulation Language). | DDL (Data Definition Language). | DDL (Data Definition Language). |
| **Filtering (`WHERE`)** | Fully supports `WHERE` clauses to delete specific individual rows. | `WHERE` clause strictly **forbidden**; wipes all rows instantly. | `WHERE` clause strictly **forbidden**; destroys the object. |
| **Transaction Log** | Logs every single row deletion inside the undo buffer. **Slower**. | Deallocates data pages directly. Minimal logging. **Extremely fast**. | Removes table references from the metadata dictionary instantly. |
| **Rollback Support** | Can be rolled back entirely before a `COMMIT`. | Cannot be rolled back in standard auto-commit modes. | Cannot be rolled back. |
| **Structure Survival** | Table schema and indexes survive untouched. | Table schema and indexes survive untouched. | Table schema, data, and attached indexes are completely annihilated. |

---

### 15. GROUP BY and HAVING Clause

* **`GROUP BY`:** Used to partition the result set into subsets of rows based on identical values in one or more specified columns, allowing aggregate functions (`COUNT()`, `SUM()`, `AVG()`) to be executed independently on each group.
* **`HAVING`:** Used strictly to apply filtering predicates to the aggregated groups produced by the `GROUP BY` clause.
* **Execution Order:** `FROM` $\rightarrow$ `WHERE` (filters raw rows) $\rightarrow$ `GROUP BY` (forms groups) $\rightarrow$ `HAVING` (filters groups) $\rightarrow$ `SELECT` $\rightarrow$ `ORDER BY`.

```sql
SELECT Department, AVG(Salary) AS Avg_Sal
FROM Employee
WHERE Status = 'ACTIVE'
GROUP BY Department
HAVING AVG(Salary) > 60000;

```

---

### 16. Functional Dependency and Armstrong’s Axioms

A **Functional Dependency (FD)** $X \rightarrow Y$ holds on a relation schema $R$ if, for any two tuples $t_1$ and $t_2$ in $R$, whenever $t_1[X] = t_2[X]$, it necessarily implies that $t_1[Y] = t_2[Y]$.

**Armstrong’s Primary Axioms (Sound and Complete):**

1. **Reflexivity:** If $Y \subseteq X$, then $X \rightarrow Y$ (Trivial Dependency).
2. **Augmentation:** If $X \rightarrow Y$, then $XZ \rightarrow YZ$ for any set of attributes $Z$.
3. **Transitivity:** If $X \rightarrow Y$ and $Y \rightarrow Z$, then $X \rightarrow Z$.

---

### 17. Second and Third Normal Forms (2NF & 3NF)

* **First Normal Form (1NF):** Dictates that the domain of every attribute must contain only atomic (indivisible) values. Multi-valued and composite attributes are forbidden.
* **Second Normal Form (2NF):** A relation is in 2NF if it is in 1NF and completely free of **Partial Dependencies**. No non-prime attribute (an attribute not participating in any candidate key) can be functionally dependent on a proper subset of any candidate key.
* **Third Normal Form (3NF):** A relation is in 3NF if it is in 2NF and completely free of **Transitive Dependencies**. For every non-trivial functional dependency $X \rightarrow Y$, at least one of the following conditions must hold true:
1. $X$ is a Super Key of $R$.
2. $Y$ is a **Prime Attribute** of $R$ (participates in some candidate key).



---

### 18. Boyce-Codd Normal Form (BCNF)

**BCNF** is a mathematically stricter extension of 3NF. A relation schema $R$ is in BCNF if, for every non-trivial functional dependency $X \rightarrow Y$ holding on $R$, **$X$ is strictly a Super Key**. BCNF eliminates redundancies that 3NF allows when a table contains multiple overlapping candidate keys.

* **Example of 3NF holding while BCNF fails:**
Consider $R(\text{Student}, \text{Advisor}, \text{Course})$ with FDs:

$$\{\text{Student}, \text{Course}\} \rightarrow \text{Advisor}$$


$$\text{Advisor} \rightarrow \text{Course}$$


* *Candidate Keys:* $\{\text{Student}, \text{Course}\}$ and $\{\text{Student}, \text{Advisor}\}$. Prime attributes are all three.
* *3NF Check:* For $\text{Advisor} \rightarrow \text{Course}$, the right side (`Course`) is a prime attribute. Thus, the table is fully valid in **3NF**.
* *BCNF Check:* For $\text{Advisor} \rightarrow \text{Course}$, the determinant (`Advisor`) is **not** a super key. Thus, the table explicitly **fails BCNF**.



---

### 19. Lossless-Join Decomposition

A decomposition of a relation schema $R$ into two schemas $R_1$ and $R_2$ is a **Lossless-Join Decomposition** if the natural join of the projected relational instances strictly reconstructs the original un-decomposed relation without generating spurious tuples:


$$r = \pi_{R_1}(r) \bowtie \pi_{R_2}(r)$$

* **Mathematical Matrix Test Condition:** The decomposition is lossless if and only if the common attribute set forms a super key for at least one of the decomposed tables:

$$(R_1 \cap R_2) \rightarrow R_1 \quad \text{OR} \quad (R_1 \cap R_2) \rightarrow R_2$$



---

### 20. Lossless vs. Dependency-Preserving Decomposition

| Parameter | Lossless-Join Decomposition | Dependency-Preserving Decomposition |
| --- | --- | --- |
| **Primary Objective** | Prevents the generation of **spurious tuples** during table joins. | Ensures all original functional dependencies can be enforced locally. |
| **Mathematical Validation** | $(R_1 \cap R_2) \rightarrow R_1$ or $R_2$. | $(F_1 \cup F_2)^+ = F^+$. |
| **Status in DB Design** | **Absolute mandatory requirement.** | Desirable, but can occasionally be sacrificed for BCNF. |
| **Violation Consequence** | Queries return completely invalid, fabricated data rows. | Requires expensive cross-table joins to validate updates. |

---

### 21. Database Anomalies

Anomalies are severe data inconsistencies resulting from storing unnormalized, structurally redundant relations.
Consider an unnormalized table: `Allocations(Emp_ID, Emp_Name, Dept_Name, Dept_Head)`

1. **Insertion Anomaly:** Impossibility of adding a legitimate piece of data without adding fabricated data. *Example:* We cannot add a new `Dept_Name` ("AI Research") and its `Dept_Head` into the database until we recruit at least one employee (`Emp_ID`) to assign to it, because `Emp_ID` acts as the primary key.
2. **Deletion Anomaly:** The accidental loss of vital peripheral data when deleting primary data. *Example:* If the sole employee working in the "Geology" department resigns and we delete their `Emp_ID` row, we permanently lose the factual record of who the `Dept_Head` of Geology is.
3. **Modification (Updation) Anomaly:** Partial updating of redundant data causing logical corruption. *Example:* If the `Dept_Head` of "Sales" changes, we must locate and update every single row belonging to a Sales employee. Missing even one row results in the database reporting two different heads for the same department simultaneously.

---

### 22. Canonical Cover (Minimal Cover)

A **Canonical Cover ($F_c$)** of a set of functional dependencies $F$ is a minimal, simplified set of dependencies that is mathematically equivalent to $F$ (meaning $F_c^+ = F^+$) and completely free of extraneous attributes or redundant dependencies.

**Algorithmic Synthesis Steps:**

1. **RHS Decomposition:** Use the decomposition rule to ensure every FD has strictly a single attribute on its right-hand side ($X \rightarrow YZ \implies X \rightarrow Y, X \rightarrow Z$).
2. **Extraneous Attribute Elimination:** Inspect the left side of every composite FD. If removing an attribute $A$ from $AB \rightarrow C$ leaves the closure unaffected (i.e., $B \rightarrow C$ can be derived), strip $A$ out.
3. **Redundant FD Elimination:** Inspect every single remaining dependency $X \rightarrow Y$. If $X \rightarrow Y$ can be fully derived using the remaining dependencies in $F_c - \{X \rightarrow Y\}$, delete it entirely.

---

### 23. Nested Subqueries

A **Nested Subquery** is a standard `SELECT-FROM-WHERE` expression embedded directly inside the `WHERE` or `HAVING` predicate clause of another enclosing SQL query.

* **Uncorrelated Subquery:** Executed strictly once before the outer query runs. Its resulting scalar value or list is passed up to the outer query's evaluation loop.
```sql
SELECT Name FROM Employee WHERE Salary > (SELECT AVG(Salary) FROM Employee);

```


* **Correlated Subquery:** Contains structural references to attribute columns belonging to the outer query. The subquery is forcefully re-executed once for *every single individual row* evaluated by the outer loop.
```sql
SELECT Emp_Name FROM Employee E1 WHERE Salary > (
    SELECT AVG(Salary) FROM Employee E2 WHERE E1.Department = E2.Department
);

```



---

### 24. Relational Algebra vs. SQL

| Parameter | Relational Algebra (RA) | Structured Query Language (SQL) |
| --- | --- | --- |
| **Language Paradigm** | **Procedural mathematical language.** | **Declarative commercial language.** |
| **Operational Focus** | Specifies explicitly *how* to construct the query step-by-step. | Specifies *what* data is required, delegating execution logic to the engine. |
| **Duplicate Row Handling** | Strictly represents mathematical sets; **automatically eliminates** all duplicate tuples. | Represents multi-sets (bags); **retains duplicates** unless `DISTINCT` is explicitly written. |
| **Practical Implementation** | Purely an abstract internal engine language. | The universal standard programming interface for RDBMS. |
| **Ordering & Aggregation** | Lacks native sorting (`ORDER BY`) or arithmetic aggregate grouping capabilities. | Fully supports structural aggregation, grouping, casting, and output sorting. |

# 📘 MAKAUT DBMS (PCC-CS601) Exam Notebook

## **Part 2: Unit 3 & Unit 4 (Indexing, Optimization, Transactions & Concurrency)**

---

## 🔹 UNIT 3: Indexing & Query Optimization

### 25. Dense vs. Sparse Indexing

An index is a small physical file used to optimize lookup operations. It consists of `(Search_Key, Block_Pointer)` records.

* **Dense Index:** An index record appears for **every single search-key value** present in the data file.
* *Pros:* Faster search query resolution.
* *Cons:* Consumes massive memory/disk space; expensive to update during table insertions.


* **Sparse Index:** An index record appears for **only some search-key values**.
* **Absolute Rule:** A sparse index can *only* be constructed if the base data file is **sequentially sorted** by that exact search key. The engine looks up the nearest lower index value, jumps to that block, and performs a brief linear scan.



```
DENSE INDEXING:                 SPARSE INDEXING:
 [Index File]   [Data Blocks]    [Index File]    [Data Blocks]
 ┌───┬───┐       ┌──────────┐    ┌───┬───┐       ┌──────────┐
 │10 │ ┼─┼──────►│ 10,  15  │    │10 │ ┼─┼──────►│ 10,  15  │
 ├───┼───┤       ├──────────┤    ├───┼───┤       ├──────────┤
 │15 │ ┼─┘       │ 20,  25  │    │30 │ ┼─┼──┐    │ 20,  25  │
 ├───┼───┤       ├──────────┤    └───┴───┘  │    ├──────────┤
 │20 │ ┼─┼──────►│ 30,  35  │               └───►│ 30,  35  │
 └───┴───┘       └──────────┘                    └──────────┘

```

---

### 26. B-Tree vs. B+ Tree

| Feature | B-Tree | B+ Tree |
| --- | --- | --- |
| **Data Record Storage** | Data pointers are stored in **both** internal nodes and leaf nodes. | Data pointers are strictly stored **only in leaf nodes**. |
| **Key Redundancy** | Keys do not repeat; each search key appears exactly once. | Internal keys repeat at the leaf level to serve as navigational splitters. |
| **Leaf Connectivity** | Leaf nodes are completely disconnected. | Leaf nodes are connected via a **doubly linked list** ($O(1)$ range scans). |
| **Search Time** | Unpredictable; search can terminate early at an internal node. | Highly predictable; **every** search must traverse down to a leaf node. |
| **Node Fan-out ($m$)** | Lower branching factor (internal nodes hold bulky data pointers). | **Higher branching factor** (flatter tree $\implies$ significantly fewer disk I/O hits). |

---

### 27. Heuristic Query Optimization

Heuristic optimization applies rigid, rule-based algebraic equivalences to transform an unoptimized relational algebra tree into an execution plan that minimizes the size of intermediate tables.

**The Golden Transformation Rules:**

1. **Push down Selections ($\sigma$):** Move $\sigma$ operations as far down the query tree as possible. *Reason:* Filtering out rows early drastically reduces the tuple volume passed up to expensive join operations.
2. **Combine Cartesian Product ($\times$) with Selection ($\sigma$):** Transform any $(\sigma_{\theta}(R \times S))$ directly into an Equi-Join or Theta-Join ($R \bowtie_{\theta} S$).
3. **Push down Projections ($\pi$):** Eliminate unneeded attribute columns immediately at the leaf scanning level.

---

### 28. Clustering Index

A **Clustering Index** is created when the physical records of a data file are sequentially ordered on disk based on a **Non-Primary Key** attribute (e.g., sorting the `Employee` table physically by `Department_ID`).

* **The "Single Sequence" Law:** A database table can possess **strictly one** clustering index. Because data rows can only be physically sorted into one specific spatial sequence on a hard drive at any given moment, attempting to cluster by two different columns simultaneously is a physical impossibility.

---

### 29. Static vs. Dynamic (Extendible) Hashing

* **Static Hashing:** Uses a fixed hash function $h(K) \pmod B$ pointing to a static set of $B$ buckets. As the database grows, buckets suffer from **Bucket Overflow**, forcing the engine to generate degraded, slow *Overflow Chaining linked lists*.
* **Dynamic (Extendible) Hashing:** Employs a dynamic directory of size $2^d$, where $d$ is the **Global Depth**. Buckets hold a **Local Depth** ($d' \le d$).
* *The Split Logic:* When a bucket overflows, only that specific bucket splits. If its $d' < d$, its local depth increments by 1. If its $d' = d$, the central directory **instantly doubles in size** ($d \to d+1$), remapping binary bit-pointers without requiring a full database re-hash.



---

### 30. Buffer Management Internals

The Buffer Manager is the OS-level software responsible for paging database blocks back and forth between physical disk storage and RAM frames.

* **Pin Count:** A memory register tracking the number of active transactions currently reading or writing a specific RAM page. If `Pin_Count > 0`, the page is "pinned" and the engine is strictly forbidden from evicting it.
* **Dirty Bit:** A boolean flag set to `1` the moment a transaction modifies the data inside a RAM frame. When the page replacement algorithm selects a dirty page for eviction, it must force a **Write-Back to disk** before overwriting the RAM frame.
* **Replacement Policy:** While standard operating systems use **LRU** (Least Recently Used), DBMS engines switch to **MRU** (Most Recently Used) during sequential table scans to prevent "Buffer Poisoning" (flushing out hot index pages to load one-time-use scan blocks).

---

---

## 🔹 UNIT 4: Transactions & Concurrency (🔥 THE CRITICAL CORE)

### 31. ACID Properties & Their Enforcement Engines

A transaction is a single logical unit of work. To maintain database integrity, it must strictly pass the ACID test:

1. **Atomicity ("All or Nothing"):** The entire transaction executes to completion, or it is completely rolled back as if it never happened.
* *Enforced by:* **Transaction Recovery Manager** (via the Undo log buffer).


2. **Consistency:** The transaction must transition the database from one mathematically valid state to another, strictly obeying all declared integrity constraints.
* *Enforced by:* **The Application Programmer** and the **Integrity Subsystem**.


3. **Isolation:** Concurrent transactions must execute entirely shielded from one another; an active transaction cannot view the partial, uncommitted calculations of another.
* *Enforced by:* **The Concurrency Control Engine** (Locking / Timestamp schedulers).


4. **Durability:** Once a transaction executes a `COMMIT`, its updates survive any subsequent system crash, power loss, or catastrophic hardware failure.
* *Enforced by:* **The Recovery Manager** (via the Redo log buffer forced to non-volatile storage).



---

### 32. Serializability & Conflict Serializability

* **Serial Schedule:** A schedule where transactions execute end-to-end consecutively with **zero** operational interleaving. It is mathematically guaranteed to be correct.
* **Conflict Serializable Schedule:** A non-serial, interleaved schedule that can be transformed into an equivalent serial schedule strictly by executing a series of non-conflicting instruction swaps.
* **The Conflict Condition:** Two instructions $I_i$ and $I_j$ are in **Conflict** if and only if:
1. They belong to two different transactions ($T_i \neq T_j$).
2. They access the exact same data item ($Q$).
3. **At least one of the instructions is a `Write(Q)` operation.**
*(Read-Read operations never conflict).*



---

### 33. Precedence Graph (Serialization Graph)

A Precedence Graph $G = (V, E)$ is a direct algorithmic test used to determine if an interleaved schedule is Conflict Serializable.

* **Construction Algorithm:**
1. Create a vertex $v \in V$ for every active transaction $T_i$.
2. Draw a directed edge $T_i \longrightarrow T_j$ if $T_i$ executes a conflicting instruction on data item $Q$ strictly *before* $T_j$ executes its conflicting instruction on $Q$.


* **The Absolute Test Theorem:** An interleaved schedule is Conflict Serializable **if and only if its Precedence Graph contains ZERO directed cycles**.

---

### 34. Two-Phase Locking Protocol (2PL)

**2PL** is a pessimistic locking protocol that mathematically guarantees Conflict Serializability. It divides a transaction's lifespan into two monotonic phases:

1. **Growing Phase:** The transaction may acquire new locks (Shared `S` or Exclusive `X`), but is strictly forbidden from releasing any locks.
2. **Shrinking Phase:** The transaction may release existing locks, but is strictly forbidden from acquiring any new locks. Once the first lock is dropped, the growing phase permanently ends.

```
 Locks Held ▲
            │       /\
            │      /  \   <-- Shrinking Phase (Releasing locks)
            │     /    \
            │    /      \
            │   /        \
            └──┴──────────┴────────► Time
              Growing Phase (Acquiring locks)

```

> **The MAKAUT Trap Answer:** While 2PL successfully guarantees Serializability, **it DOES NOT prevent Deadlocks or Cascading Rollbacks.** If $T_1$ drops a lock in its shrinking phase, $T_2$ reads it, and $T_1$ subsequently aborts, $T_2$ is forced into a fatal cascading rollback.

---

### 35. Strict 2PL vs. Rigorous 2PL

| Feature | Basic 2PL | Strict 2PL | Rigorous 2PL |
| --- | --- | --- | --- |
| **Lock Acquisition** | 2PL rules (Growing Phase). | 2PL rules (Growing Phase). | 2PL rules (Growing Phase). |
| **Shared (`S`) Lock Release** | Instantly during Shrinking Phase. | Instantly during Shrinking Phase. | **Held until COMMIT / ABORT.** |
| **Exclusive (`X`) Lock Release** | Instantly during Shrinking Phase. | **Held until COMMIT / ABORT.** | **Held until COMMIT / ABORT.** |
| **Cascading Rollback Status** | VULNERABLE. | **PREVENTED.** | **PREVENTED.** |
| **Concurrency Level** | High. | Moderate (Industry Standard). | Extremely Low. |

---

### 36. Lock-Based vs. Timestamp-Based Protocols

* **Lock-Based Protocols (Pessimistic):** Assume data conflicts *will* happen. They force transactions to halt and wait in physical RAM queues until competing locks are released.
* **Timestamp-Based Protocols (Optimistic/Preemptive):** Assume conflicts are rare. The engine assigns a unique timestamp $TS(T_i)$ to each transaction at startup. **It never uses lock queues.** If a read/write conflict occurs, the protocol resolves it instantly by checking timestamps and preemptively **Aborting or Rolling Back** the violating transaction.

---

### 37. Wait-Die vs. Wound-Wait Protocols

These are non-locking timestamp schemes designed explicitly to **Prevent Deadlocks**. When a resource conflict occurs ($T_A$ requests a data item currently held by $T_B$), the engine compares their age:

* *Age Rule:* The older transaction possesses the **smaller** numerical timestamp value.

```
======================================================================
               WAIT-DIE PROTOCOL (Non-Preemptive)
======================================================================
 If OLDER requests from YOUNGER  ──►  Older WAITS peacefully.
 If YOUNGER requests from OLDER  ──►  Younger instantly DIES (Aborts).
----------------------------------------------------------------------
               WOUND-WAIT PROTOCOL (Preemptive)
======================================================================
 If OLDER requests from YOUNGER  ──►  Older WOUNDS Younger (Forces abort).
 If YOUNGER requests from OLDER  ──►  Younger WAITS peacefully.
======================================================================

```

---

### 38. Granularity of Locking

Lock Granularity defines the spatial size of the data unit locked by a transaction. The engine organizes data into a structural tree: `Database` $\to$ `Table` $\to$ `Page` $\to$ `Row`.

* **Intention Locks (`IS` / `IX`):** To avoid scanning millions of individual row locks when a user requests a blanket table lock, the DBMS uses **Intention Locking**. If $T_1$ places an Exclusive (`X`) lock on Row #45, the engine automatically places an Intention-Exclusive (`IX`) lock on the parent `Page`, the parent `Table`, and the `Database`.
* *Result:* If $T_2$ attempts to drop an `X` lock on the entire Table, it detects the `IX` flag at the Table level and halts instantly, saving the CPU an exhaustive table scan.

---

### 39. Deadlock Detection vs. Prevention

* **Deadlock Detection:** The DBMS lets deadlocks form organically. A background daemon periodically inspects active lock tables and constructs a **Wait-For Graph (WFG)** (a Precedence Graph stripped of data item labels). If the Big-O cycle detector finds a closed loop, the engine invokes a **Victim Selection algorithm** (killing the transaction with the lowest undo cost).
* **Deadlock Prevention:** The DBMS guarantees a cycle can never form by enforcing strict timestamp preemption rules (Wait-Die / Wound-Wait) or forcing transactions to declare and lock all required resources upfront before execution begins.

---

### 40. Concurrency Control Anomalies (The 4 Horsemen)

#### 1. Dirty Read (Write-Read Conflict)

Occurs when $T_1$ updates a row, $T_2$ reads that updated row, and $T_1$ subsequently executes an `ABORT`. $T_2$ is left operating on "dirty", non-existent garbage data.

```
  Transaction 1 (T1)             Transaction 2 (T2)
 ───────────────────────────────────────────────────
  Read(A);                       
  A = A + 100;                   
  Write(A);                      
                                 Read(A);  <-- [Reads Dirty A]
  ABORT; (Rolls back A)          
                                 COMMIT;   <-- [Saves corrupted logic]

```

#### 2. Non-Repeatable Read (Read-Write Conflict)

Occurs when $T_1$ reads a row, $T_2$ overwrites that exact row and commits, and $T_1$ re-reads the row within the same transaction, discovering the data has mysteriously mutated.

#### 3. Phantom Read

Occurs when $T_1$ executes a query across a range condition (`SELECT * WHERE Age > 30`), $T_2$ inserts a brand new employee aged 35 and commits, and $T_1$ re-executes the exact same query, discovering a "phantom" row has materialized out of nowhere. *(Requires `SERIALIZABLE` isolation to fix).*

#### 4. Lost Update (Write-Write Conflict)

Occurs when two transactions read the same initial value, perform blind calculations, and overwrite each other's work based on stale data.

```
  Transaction 1 (T1)             Transaction 2 (T2)
 ───────────────────────────────────────────────────
  Read(A); [Reads 100]           
                                 Read(A); [Reads 100]
  A = A + 20;                    
  Write(A); [Writes 120]         
                                 A = A + 50;
                                 Write(A); [Writes 150]
 ───────────────────────────────────────────────────
  Result: T1's addition of 20 is permanently erased.

# 📘 MAKAUT DBMS (PCC-CS601) Exam Notebook

## **Part 3: Unit 5 & Unit 6 (Security, Distributed DB & Recovery Internals)**

---

## 🔹 UNIT 5 & 6: Security, Distributed Systems & Advanced Recovery

### 41. Access Control Models: DAC vs. MAC vs. RBAC

Access control models dictate how a database kernel decides whether a specific user can execute a read, write, or update operation on a data object.

* **Discretionary Access Control (DAC):** The **owner** of the table possesses the absolute discretion to grant or revoke access privileges to other users at will using standard SQL DCL commands (`GRANT SELECT ON Table TO Bob`).
* **Mandatory Access Control (MAC):** Access is governed rigidly by the **Operating System / Database Kernel** based on system-wide security clearance levels (e.g., `Top Secret`, `Secret`, `Unclassified`). Even the table's creator cannot override MAC rules.
* *The Bell-LaPadula Principle:* **Read-Down** (a subject can only read objects at their own clearance level or lower) and **Write-Up** (a subject can only write to objects at their own level or higher, preventing high-level secrets from being leaked downward).


* **Role-Based Access Control (RBAC):** Privileges are tied strictly to official **Organizational Roles** (`DBA`, `Teller`, `Auditor`), not individual user accounts. Users are dynamically slotted into roles.

---

### 42. SQL Injection (SQLi) Mechanics & Prevention

**SQL Injection** occurs when an application takes unvalidated user input and concatenates it directly into a backend database query string, allowing an attacker to manipulate the query's structural syntax.

* **The Tautology Attack:** An attacker enters `' OR '1'='1` into a password field.
```sql
-- Intended Query:
SELECT * FROM Users WHERE User = 'admin' AND Pass = 'input';
-- Manipulated Executed Query:
SELECT * FROM Users WHERE User = 'admin' AND Pass = '' OR '1'='1';

```


Because `'1'='1'` is mathematically always true, the entire `WHERE` predicate evaluates to true, instantly returning the first record in the table (usually the root admin).
* **The Absolute Defense: Parameterized Queries (`PreparedStatement`)**
When deploying parameterized queries, the DBMS query compiler pre-compiles the SQL syntax skeleton *before* accepting user data. When the input arrives, the engine treats it strictly as a literal scalar string, stripping it of all executable operational power.

---

### 43. The Mechanics of a Recovery Checkpoint

A **Checkpoint** ($<checkpoint\ L>$) is a point in the active transaction log where the database storage engine deliberately halts accepting new updates and forces all modified (dirty) in-memory data buffer pages out to physical non-volatile disk storage.

**The Crash-Recovery Saving:**
When the system reboots after a hard crash, the Recovery Manager scans the log *backward*. The moment it encounters the most recent $<checkpoint\ L>$ marker, it **halts its scan entirely**. It knows with absolute mathematical certainty that any transaction that committed prior to this checkpoint has its calculations permanently baked into the physical disk.

```
 LOG BACKWARD SCAN ──► [HALTS HERE]
... <T1, Commit> ... <Checkpoint {T2}> ... <T2, Write, A, 10> ... [CRASH]
 ───────────────────────────┬──────────────────────────────────────────
   Safely Ignored           │  Active Zone (Requires Redo / Undo)

```

---

### 44. The Three Classifications of Database Failures

1. **Transaction Failure:** An individual transaction halts prematurely due to a *Logical Error* (bad input data, divide-by-zero exception) or a *System Error* (the DBMS kernel autonomously aborts the transaction to break an active Deadlock).
2. **System Crash:** A severe hardware or OS-level failure (power outage, kernel panic, RAM corruption) that instantly wipes out all volatile memory buffers. **The physical disk storage survives intact.**
3. **Disk Failure:** The physical destruction of the non-volatile storage medium (head crash, bad disk sectors, controller fire). *The only recovery path:* Restoring an archived off-site database dump and reapplying the backed-up redo logs.

---

### 45. Horizontal vs. Vertical Data Fragmentation

In a Distributed DBMS, tables are broken into spatial fragments and scattered across different geographical network nodes to minimize remote network packet latency.

* **Horizontal Fragmentation:** Partitions a table into horizontal subsets of **Tuples (Rows)** based on a specified filtering predicate.

$$\text{Fragment}_{\text{US}} = \sigma_{\text{Country} = '\text{USA}'}(\text{Global\_Customers})$$


* *Reconstruction Operator:* The root engine reconstructs the master table via the **Union ($\cup$)** operator.


* **Vertical Fragmentation:** Partitions a table into vertical subsets of **Attributes (Columns)**.

$$\text{Fragment}_{\text{Secure}} = \pi_{\text{Cust\_ID}, \text{Credit\_Card}}(\text{Global\_Customers})$$


* *The Mandatory Rule:* Every single vertical fragment **must include the Primary Key** attribute. If the primary key is missing, reconstructing the master table via a **Natural Join ($\bowtie$)** becomes mathematically impossible.



---

### 46. Homogeneous vs. Heterogeneous Distributed DBMS

| Architectural Parameter | Homogeneous Distributed DBMS | Heterogeneous Distributed DBMS |
| --- | --- | --- |
| **Operating Engine** | Every network site runs the **exact same DBMS software** (e.g., all 12 global nodes run Oracle 19c). | Network sites run **completely different DBMS engines** (e.g., Node A runs MySQL, Node B runs MS-SQL). |
| **Data Model** | Identical across all sites (strictly Relational). | Can mix models (Relational at Site A, Object-Oriented at Site B). |
| **Transaction Management** | Native, highly streamlined 2-Phase Commit (2PC) over proprietary network protocols. | Requires a bulky, highly complex **Middleware / Gateway translation layer** via XA protocols. |
| **Local Autonomy** | Usually lower; central catalog governs nodes. | Extremely high; individual sites operate as sovereign standalone databases. |

---

### 47. Data Warehousing vs. Data Mining

* **Data Warehousing:** The foundational architectural process of extracting data from multiple disparate operational OLTP databases, cleaning it, transforming it, and loading (**ETL**) it into a massive, read-optimized centralized historical database engineered strictly for analytical queries (**OLAP**).
* **Data Mining:** The downstream computational process of deploying heavy statistical algorithms, neural networks, and decision trees against the populated Data Warehouse to discover **hidden predictive correlations, anomalies, and market trends** that human analysts cannot perceive.

---

### 48. Logless Recovery: Shadow Paging

**Shadow Paging** is an alternative crash-recovery technique that completely bypasses the massive disk I/O overhead of writing a continuous recovery log file.

* **The Dual-Table Architecture:** During an active transaction, the kernel maintains two independent spatial page-pointer tables in RAM:
1. **Current Page Table:** Points to the newly written, uncommitted data blocks on disk.
2. **Shadow Page Table:** Points strictly to the original, untouched data blocks.


* **The Atomic Commit:** To commit, the OS simply executes a single atomic disk-pointer write, overwriting the root location of the Shadow Table with the pointer of the Current Table.
* **The Crash Action:** If the power cuts out mid-calculation, the system discards the Current Page Table from RAM. The disk remains pristine, pointing to the original Shadow Table.

---

### 49. Immediate vs. Deferred Update Recovery Protocols

When a transaction issues a `Write(Q)` command, the recovery protocol dictates when that update hits the actual physical hard drive:

| Parameter | Deferred Database Modification | Immediate Database Modification |
| --- | --- | --- |
| **Disk Write Timing** | Physical disk writes are **strictly deferred** until after the transaction issues a `COMMIT`. | Physical disk writes occur **immediately** while the transaction is still actively running. |
| **Log Buffer Entry** | `<T_i, Write, Q, New_Value>` | `<T_i, Write, Q, Old_Value, New_Value>` |
| **Crash Action (Active Tx)** | **No Undo required.** The physical disk was never touched. Simply discard RAM buffers. | **Mandatory Undo required.** Must scan backward and restore `Old_Value` to physical disk. |
| **Crash Action (Committed)** | **Mandatory Redo required.** Must read log forward and force `New_Value` to disk. | **Mandatory Redo required** (if OS buffer hadn't flushed to disk prior to crash). |

---

### 50. Distributed Replication: Synchronous vs. Asynchronous

Replication is the storing of duplicate copies of a relation across multiple network sites to guarantee high data availability.

* **Synchronous Replication:** A user's `COMMIT` command does not return success until the modified data packet has been successfully transmitted to, and confirmed written by, **every single replica node** across the global network.
* *Result:* Absolute zero data loss, but **horrendously slow write-latency**.


* **Asynchronous Replication:** The root master node commits the transaction locally and returns success to the user instantly. It drops the replication packets into a background network queue to be broadcasted to the replica nodes later.
* *Result:* Blazing fast user experience, but introduces a **"Replication Window" vulnerability** where a sudden master crash causes permanent data loss.



---

---

## 📘 Part 4: The Group C Hard-Carries (Solved Step-by-Step)

*(The 10 absolute most tested MAKAUT 15-mark mathematical & structural archetypes)*

### 51. Precedence Graph & Conflict Serializability Prover

**The Interleaved Schedule $S$:**


$$S: r_1(X);\ r_2(Z);\ r_1(Z);\ r_3(X);\ r_3(Y);\ w_1(X);\ w_3(Y);\ r_2(Y);\ w_2(Z);\ w_2(Y);$$

#### Step 1: Isolate Conflicting Instruction Pairs

We scan the schedule left-to-right to locate every instance where two different transactions access the same variable, and at least one operation is a `Write`.

1. Look at variable $X$:
* $r_3(X)$ occurs before $w_1(X) \implies$ **Directed Edge $T_3 \longrightarrow T_1$**


2. Look at variable $Z$:
* $r_1(Z)$ occurs before $w_2(Z) \implies$ **Directed Edge $T_1 \longrightarrow T_2$**


3. Look at variable $Y$:
* $r_3(Y)$ occurs before $w_2(Y) \implies$ **Directed Edge $T_3 \longrightarrow T_2$**
* $w_3(Y)$ occurs before $r_2(Y) \implies$ **Directed Edge $T_3 \longrightarrow T_2$**



#### Step 2: Construct the Precedence Graph

```
        [ T3 ] ───► [ T1 ]
          │           │
          └─────► [ T2 ] ◄┘

```

#### Step 3: Evaluate for Directed Cycles

Inspecting our topological graph, all arrows point strictly left-to-right. There are zero backward-pointing loop edges.


$$\text{Cycles} = 0 \implies \mathbf{The\ schedule\ is\ Conflict\ Serializable.}$$

#### Step 4: Output Equivalent Topological Serial Order

By reading the graph from the root node with zero incoming edges down to the sink node:


$$\mathbf{\text{Equivalent Serial Schedule} = T_3 \longrightarrow T_1 \longrightarrow T_2}$$

---

### 52. The Master Normalization Numerical

**Given Relation:** $R(A, B, C, D, E, F)$
**Functional Dependencies:** $F = \{A \rightarrow BC,\ C \rightarrow D,\ B \rightarrow E,\ E \rightarrow F\}$

#### Part (a): Compute Attribute Closures $(AB)^+$ and $(AC)^+$

* $(AB)^+ = \{A, B\}$
* Apply $A \rightarrow BC \implies \{A, B, C\}$
* Apply $C \rightarrow D \implies \{A, B, C, D\}$
* Apply $B \rightarrow E \implies \{A, B, C, D, E\}$
* Apply $E \rightarrow F \implies \mathbf{\{A, B, C, D, E, F\}}$


* $(AC)^+ = \{A, C\}$
* Apply $A \rightarrow BC \implies \{A, B, C\}$
* Apply $C \rightarrow D \implies \{A, B, C, D\}$
* Apply $B \rightarrow E \implies \{A, B, C, D, E\}$
* Apply $E \rightarrow F \implies \mathbf{\{A, B, C, D, E, F\}}$



#### Part (b): Formally Identify all Candidate Keys

To find the candidate keys, we check if any single attribute can derive the universal set.
Let's check $A^+$:

* $A^+ = \{A\}$
* Apply $A \rightarrow BC \implies \{A, B, C\}$
* Apply $C \rightarrow D \implies \{A, B, C, D\}$
* Apply $B \rightarrow E \implies \{A, B, C, D, E\}$
* Apply $E \rightarrow F \implies \mathbf{\{A, B, C, D, E, F\}}$



Because $A^+ = R$, **$A$ is a Super Key**. Since a single attribute cannot be reduced further, **$A$ is a Candidate Key**.
*Are there any other candidate keys?* Inspect the RHS of all functional dependencies. No dependency derives attribute $A$. Therefore, $A$ can never be substituted out.


$$\mathbf{\text{Candidate Key} = \{A\}} \quad (\text{Prime Attribute} = A, \text{ Non-Prime} = B,C,D,E,F)$$

#### Part (c): Determine Highest Normal Form

Let's test each dependency against our candidate key $\{A\}$:

1. $A \rightarrow BC$: Determinant $A$ is a super key. (Valid BCNF).
2. $C \rightarrow D$: Determinant $C$ is **not** a super key. (Violates BCNF & 3NF). Right side $D$ is a non-prime attribute. (Violates 2NF & 3NF).

Because $C \rightarrow D$ represents a transitive dependency ($A \rightarrow C \rightarrow D$), **the relation is currently in 1NF**.

#### Part (d): BCNF Step-by-Step Lossless Decomposition

To normalize to BCNF, we isolate the violating functional dependencies and split the relation.

* **Violation 1:** $C \rightarrow D$
* *Decompose into:* $R_1(\mathbf{C}, D)$ and $R_{\text{Rem1}}(A, B, C, E, F)$


* Inspect $R_{\text{Rem1}}$ FDs: $\{A \rightarrow BC,\ B \rightarrow E,\ E \rightarrow F\}$.
* **Violation 2:** $B \rightarrow E$ (Determinant $B$ is not a super key of $R_{\text{Rem1}}$).
* *Decompose into:* $R_2(\mathbf{B}, E)$ and $R_{\text{Rem2}}(A, B, C, F)$


* Inspect $R_{\text{Rem2}}$ FDs: $\{A \rightarrow BC,\ B \rightarrow F\}$ *(Derived via $B \rightarrow E \rightarrow F$)*.
* **Violation 3:** $B \rightarrow F$ (Determinant $B$ is not a super key).
* *Decompose into:* $R_3(\mathbf{B}, F)$ and $R_4(\mathbf{A}, B, C)$



**Final Normalized BCNF Table Schemas:**


$$\mathbf{R_1(\underline{C}, D), \quad R_2(\underline{B}, E), \quad R_3(\underline{B}, F), \quad R_4(\underline{A}, B, C)}$$

---

### 53. Structural Mapping: Hospital ER to Relational Schema

**The Narrative:** A Hospital tracks *Patients*, *Doctors*, and *Medical Logs*. Doctors treat multiple patients ($1:N$). Doctors prescribe specific drugs to patients on specific dates ($M:N$).

#### Step 1: Draw the ER Diagram

```
  ┌─────────┐      (1,1) ╔═════════╗ (0,N)       ┌────────┐
  │ PATIENT │◄───────────╣ TREATS  ╠────────────►│ DOCTOR │
  └────┬────┘            ╚═════════╝             └────┬───┘
       │                                              │
       │                 ╔════════════╗               │
       └─────────────────╣ PRESCRIBES ╠───────────────┘
                   (0,N) ╚═════┬══════╝ (0,N)
                               │ [Date]
                               ▼
                          ( Drug_Code )

```

#### Step 2: Transform into Normalized SQL Schemas

```sql
-- 1. Strong Entity: Patient
CREATE TABLE Patient (
    Patient_ID INT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Age INT
);

-- 2. Strong Entity: Doctor
CREATE TABLE Doctor (
    Doctor_ID INT PRIMARY KEY,
    Doc_Name VARCHAR(100) NOT NULL,
    Specialization VARCHAR(50)
);

-- 3. The 1:N Relationship (Treats): Foreign key goes to the 'N' side (Patient)
ALTER TABLE Patient 
ADD Primary_Doctor_ID INT,
ADD CONSTRAINT fk_Doc FOREIGN KEY (Primary_Doctor_ID) REFERENCES Doctor(Doctor_ID);

-- 4. The M:N Relationship (Prescribes): Becomes a dedicated Junction Table
CREATE TABLE Prescription_Log (
    Patient_ID INT,
    Doctor_ID INT,
    Drug_Code VARCHAR(50),
    Prescription_Date DATE,
    PRIMARY KEY (Patient_ID, Doctor_ID, Drug_Code, Prescription_Date),
    FOREIGN KEY (Patient_ID) REFERENCES Patient(Patient_ID) ON DELETE CASCADE,
    FOREIGN KEY (Doctor_ID) REFERENCES Doctor(Doctor_ID) ON DELETE CASCADE
);

```

---

### 54. Step-by-Step B-Tree Insertion (Order 3)

**The MAKAUT Mathematical Law:** Order $m=3$ dictates a node can hold a **maximum of $m-1 = 2$ keys** and $3$ child pointers. When a node receives a 3rd key, it suffers an **instant overflow split**, pushing the median key up.

**Insertion Sequence:** `10, 20, 30, 12, 15, 35, 18, 38, 8, 50`

* **Insert 10, 20:**
```
[ 10 | 20 ]

```


* **Insert 30 (Overflows root `[10 | 20 | 30]` $\implies$ Median 20 pushes up):**
```
      [ 20 ]
     /      \
  [10]      [30]

```


* **Insert 12 (Drops left to `[10]`):**
```
      [ 20 ]
     /      \
 [10|12]    [30]

```


* **Insert 15 (Drops left to `[10|12]`. Overflows! Median 12 pushes up into root):**
```
     [ 12  |  20 ]
    /     |       \
 [10]    [15]     [30]

```


* **Insert 35 (Drops right to `[30]`):**
```
     [ 12  |  20 ]
    /     |       \
 [10]    [15]    [30|35]

```


* **Insert 18 (Drops middle to `[15]`):**
```
     [ 12  |  20 ]
    /     |       \
 [10]   [15|18]  [30|35]

```


* **Insert 38 (Drops right. Overflows `[30|35|38]`. Median 35 pushes up to root `[12|20|35]`):**
**ROOT OVERFLOWS!** Root splits at median 20:
```
                   [ 20 ]
                  /      \
            [ 12 ]        [ 35 ]
           /      \      /      \
        [10]   [15|18] [30]    [38]

```


* **Insert 8 (Drops far left to `[10]`):**
```
                   [ 20 ]
                  /      \
            [ 12 ]        [ 35 ]
           /      \      /      \
        [8|10] [15|18] [30]    [38]

```


* **Insert 50 (Drops far right to `[38]`):**
```
                   [ 20 ]
                  /      \
            [ 12 ]        [ 35 ]
           /      \      /      \
        [8|10] [15|18] [30]   [38|50]

```


*(Final state of the B-Tree)*.

---

### 55. Complex SQL & Relational Algebra Translation

**Schema:** `Student(Sid, Name, Marks)`, `Course(Cid, Title)`, `Enroll(Sid, Cid)`

#### Query 1: Find the Name of the student securing the 2nd highest marks.

* **SQL (Using a Nested Subquery):**
```sql
SELECT Name FROM Student 
WHERE Marks = (
    SELECT MAX(Marks) FROM Student 
    WHERE Marks < (SELECT MAX(Marks) FROM Student)
);

```


* **Relational Algebra (Set Difference approach):**
First, we isolate the absolute maximum marks:

$$M_{\text{max}} = \pi_{\text{Marks}}(\text{Student}) - \pi_{S1.\text{Marks}}\big(\sigma_{S1.\text{Marks} < S2.\text{Marks}}(\rho_{S1}(\text{Student}) \times \rho_{S2}(\text{Student}))\big)$$



Next, we find the maximum marks strictly below $M_{\text{max}}$:

$$\text{Ans} = \pi_{\text{Name}}\Big(\text{Student} \bowtie \big(\pi_{\text{Marks}}(\sigma_{\text{Marks} < M_{\text{max}}}(\text{Student})) - \pi_{S1.\text{Marks}}(\sigma_{S1.\text{Marks} < S2.\text{Marks} \land S2.\text{Marks} < M_{\text{max}}}(S1 \times S2))\big)\Big)$$



#### Query 2: Correlated Subquery to find students scoring higher than their department average.

*(Assuming schema `Student(Sid, Name, Marks, Dept)`)*:

```sql
SELECT S1.Name, S1.Marks, S1.Dept 
FROM Student S1
WHERE S1.Marks > (
    SELECT AVG(S2.Marks) 
    FROM Student S2 
    WHERE S1.Dept = S2.Dept
);

```

---

### 56. Concurrency Control Tracer: Wait-Die vs. Wound-Wait

**The Scenario:** * Transaction $T_1$ arrives at Timestamp $5$ (Older).

* Transaction $T_2$ arrives at Timestamp $10$ (Middle).
* Transaction $T_3$ arrives at Timestamp $15$ (Younger).
* At Time $t=0$, $T_2$ holds an Exclusive (`X`) lock on resource $R_A$.

#### Action 1: At $t=1$, Younger $T_3$ requests resource $R_A$ held by $T_2$.

* **Wait-Die Protocol:** Younger requesting from Older $\implies$ **Younger Dies instantly.** ($T_3$ is forcefully rolled back).
* **Wound-Wait Protocol:** Younger requesting from Older $\implies$ **Younger Waits peacefully** in RAM queue.

#### Action 2: At $t=2$, Older $T_1$ requests resource $R_A$ held by $T_2$.

* **Wait-Die Protocol:** Older requesting from Younger $\implies$ **Older Waits peacefully.**
* **Wound-Wait Protocol:** Older requesting from Younger $\implies$ **Older WOUNDS Younger.** ($T_2$ is forcefully killed and rolled back; $T_1$ instantly seizes the lock on $R_A$).

---

### 57. The Canonical Cover Derivation Numerical

**Given Set of FDs:** $F = \{A \rightarrow B,\ ABCD \rightarrow E,\ EF \rightarrow G,\ EF \rightarrow H,\ ACDF \rightarrow EG\}$

#### Step 1: Decompose all RHS attributes to single scalars

$$F = \{A \rightarrow B,\ ABCD \rightarrow E,\ EF \rightarrow G,\ EF \rightarrow H,\ ACDF \rightarrow E,\ ACDF \rightarrow G\}$$

#### Step 2: Eliminate Extraneous Left-Side Attributes

1. Look at $ABCD \rightarrow E$: Since we know $A \rightarrow B$, attribute $B$ is completely extraneous on the left side!

$$\text{Substitute } ABCD \rightarrow E \implies \mathbf{ACD \rightarrow E}$$


2. Look at $ACDF \rightarrow E$: Since we just derived $ACD \rightarrow E$, attribute $F$ is completely extraneous!

$$\text{Substitute } ACDF \rightarrow E \implies \mathbf{ACD \rightarrow E}$$



*(We now have two identical $ACD \rightarrow E$ rules; drop one).*
3. Look at $ACDF \rightarrow G$: We know $ACD \rightarrow E$. Therefore, $ACDF$ natively derives $EF$. Since $EF \rightarrow G$, the determinant $ACDF$ transitively derives $G$. Attribute $ACD$ is extraneous if we substitute $E$, but the rule itself is completely swallowed by $EF \rightarrow G$.

#### Step 3: Eliminate Redundant Dependencies

If we remove $ACDF \rightarrow G$, can we still derive it? Yes ($ACDF \rightarrow EF \rightarrow G$). Drop it entirely.

$$\mathbf{\text{Final Minimal Cover } F_c = \{A \rightarrow B,\ ACD \rightarrow E,\ EF \rightarrow G,\ EF \rightarrow H\}}$$

---

### 58. Crash Recovery Audit: Deferred Update Tracer

**The Active System Log at Crash Point:**

```
<T1, Start>
<T1, Write, A, 50>
<T2, Start>
<T2, Write, B, 100>
<T1, Commit>
[CRASH OCCURS HERE]

```

#### Step 1: Audit Transaction States

* **$T_1$:** Encountered a `<Commit>` tag prior to crash. Slotted into **Redo-List**.
* **$T_2$:** No commit tag found. Slotted into **Undo-List** (Active/Aborted).

#### Step 2: Execute Recovery Engine Logic (Deferred Update Protocol)

Because this engine operates under **Deferred Update**, actual physical hard drive writes were *never executed* for uncommitted transactions.

1. **Undo Operations:** **ZERO.** The physical disk data item $B$ was untouched by $T_2$. We simply wipe $T_2$'s dirty RAM buffer frames.
2. **Redo Operations:** We read the log forward and force $T_1$'s committed updates to physical disk:

$$\mathbf{\text{Execute: } \text{Set } A = 50 \text{ on physical hard drive.}}$$



---

### 59. Distributed DBMS: Two-Phase Commit (2PC) Execution

2PC is an atomic network protocol used to commit a single transaction across multiple distributed nodes.

#### Phase 1: The Voting Phase

1. The central **Coordinator** broadcasts a `PREPARE_T` network packet to all participant nodes.
2. Participants force their local undo/redo logs to disk. If successful, they lock their local data rows and transmit a `VOTE_COMMIT` packet back to the coordinator. If they encounter a local deadlock, they return `VOTE_ABORT`.

#### Phase 2: The Decision Phase

1. If the Coordinator receives 100% `VOTE_COMMIT` confirmations, it writes `<Commit_T>` to its central log and broadcasts a `GLOBAL_COMMIT` packet.
2. Participants execute the commit, drop their local row locks, and transmit an `ACK` (Acknowledgement) packet back to the coordinator.

```
 COORDINATOR                      PARTICIPANT NODE
 ──────────────────────────────────────────────────
  [Writes Prepare] ──► PREPARE_T ──► [Locks Local Rows]
  [Collects Votes] ◄── VOTE_COMMIT ──┘
  [Writes Commit]  ──► GLOBAL_COMMIT ──► [Commits & Drops Locks]

```

> **The MAKAUT "Blocking Problem" Proof:** If a participant node transmits a `VOTE_COMMIT` packet, it enters a strict **"Ready State"**. If the central Coordinator subsequently suffers a permanent hardware explosion *before* broadcasting the `GLOBAL_COMMIT` decision, the participant node is permanently trapped. It cannot commit, and it cannot unilaterally abort. Its local data rows remain locked indefinitely, freezing the enterprise database.

---

### 60. Checkpoint vs. Non-Checkpoint Crash Analysis Math

Let a database run continuously, processing $N$ total transactions. Let a system crash occur at time $T_{\text{crash}}$. Let an active checkpoint marker exist at time $T_{\text{chk}} < T_{\text{crash}}$.

#### The Algorithmic Time Complexity Comparison:

* **Recovery without Checkpoints:**
The engine must read the recovery log backward from $T_{\text{crash}}$ all the way to the literal creation of the database at $T_0$ to locate every active write.

$$\text{I/O Cost}_{\text{No-Check}} = \mathbf{O(N)} \quad (\text{Exhaustive scan of entire historical log})$$


* **Recovery with Checkpoints:**
The engine reads backward only until it strikes $T_{\text{chk}}$. It collects the active transaction list slaved inside the checkpoint header ($L_{\text{active}}$). The scan is strictly bounded by the oldest uncommitted transaction active at that exact timestamp.

$$\text{I/O Cost}_{\text{Check}} = \mathbf{O(K)} \quad (\text{Where } K \ll N, \text{ representing only recently active transactions})$$



*Result:* System reboot time is reduced from 4 hours down to 45 seconds.

