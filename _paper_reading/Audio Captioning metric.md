---
title: Audio Captioning metric
author: saber5203
date: 2025-03-24
category: paper_reading
layout: post
---

**AAC评价指标**

## BLEU（Bilingual Evaluation Understudy）

### 基本概念

**BLEU**是一种用于评估机器翻译质量的自动评价指标，通过比较机器生成的译文（Candidate）与人工参考译文（Reference）之间的相似度来衡量翻译的准确性。

BLEU主要基于两个关键因素：
1. **n-gram精确度（Precision）**  
   计算机器译文中与参考译文匹配的n-gram比例
2. **长度惩罚（Brevity Penalty, BP）**  
   防止机器译文过短而得分虚高

### 核心算法

#### 1. 计算n-gram匹配（通常n=1~4）
统计机器译文中所有1-gram、2-gram、3-gram、4-gram在参考译文中出现的比例。

**示例**：
- 机器译文：`the cat is on the mat`
- 参考译文：`the cat is sitting on the mat`
  - 1-gram精确度 = 6/6 = 1.0
  - 2-gram精确度 = 4/5 = 0.8

#### 2. 计算加权几何平均（通常权重均等）
对1-gram到4-gram的精确度取对数平均。

#### 3. 应用长度惩罚（BP）
$$
BP = 
\begin{cases} 
1 & \text{如果机器译文长度 ≥ 参考译文长度} \\
e^{(1 - \frac{\text{参考译文长度}}{\text{机器译文长度}})} & \text{如果机器译文长度 < 参考译文长度}
\end{cases}
$$

#### 4. 最终BLEU分数

$$ BLEU = BP \cdot \exp\left(\sum_{n=1}^N w_n \log p_n\right) $$

### 特点

#### ✅ 优点
- **自动化**：无需人工评分
- **高效**：计算速度快
- **标准化**：广泛应用

#### ❌ 缺点
- **不考虑语义**
- **依赖参考译文质量**
- **对短文本严格**

#### 典型分数范围
- **0~1**或**0~100**（百分比）
- 人类翻译：50~70
- 机器翻译：20~40

## METEOR（Metric for Evaluation of Translation with Explicit ORdering）

### 基本概念

**METEOR**是由Banerjee和Lavie于2005年提出的机器翻译评估指标，相比BLEU更注重翻译的流畅性和语义准确性。

1. **多维度匹配策略**：
   - 采用分级匹配方法（从精确匹配到语义匹配）
   - 整合外部语义资源（WordNet等）

2. **召回率导向**：
   - 特别强调参考译文中信息的完整覆盖
   - 采用调和平均数平衡准确率和召回率

3. **流畅性评估**：
   - 通过词序惩罚机制评估句子流畅度
   - 考虑词组（chunk）的连贯性

### 核心算法

#### 匹配阶段
1. **精确匹配**：
   $$ exact(w_c, w_r) = \begin{cases} 
   1 & \text{如果 } w_c = w_r \\
   0 & \text{否则}
   \end{cases} $$

2. **词干匹配**：
   $$ stem(w_c, w_r) = \begin{cases} 
   1 & \text{如果 } PorterStem(w_c) = PorterStem(w_r) \\
   0 & \text{否则}
   \end{cases} $$

3. **同义词匹配**：
   $$ synonym(w_c, w_r) = \begin{cases} 
   1 & \text{如果 } w_c \in WordNetSynset(w_r) \\
   0 & \text{否则}
   \end{cases} $$

#### 评分计算
1. **基础统计量**：
   $$ Precision = \frac{m}{c}, \quad Recall = \frac{m}{r} $$
   其中$m$是匹配词数，$c$是候选译文词数，$r$是参考译文词数

2. **调和平均数**：
   $$ F_{mean} = \frac{10 \times Precision \times Recall}{Recall + 9 \times Precision} $$

3. **词序惩罚**：
   $$ penalty = \gamma \left(\frac{chunks}{m}\right)^\theta $$
   典型值$\gamma=0.5$, $\theta=3$

4. **最终得分**：
   $$ METEOR = (1-penalty) \times F_{mean} $$

### 特点

#### 评估维度更全面
1. **语义敏感性**：
   - 整合WordNet同义词库
   - 支持词干还原匹配

2. **流畅性评估**：
   - 通过chunk-based惩罚机制
   - 比n-gram更贴近人类阅读体验

3. **资源可扩展性**：
   - 支持添加领域特定的同义词库
   - 可调整参数适应不同语言对

#### 分数范围
- 0-1之间
- 0.5以上通常表示较好的翻译质量
- 0.7以上接近人工翻译水平

### 实现
```python
import nltk
from nltk.translate.meteor_score import meteor_score

reference = "this is a reference sentence"
candidate = "this is a candidate sentence"
score = meteor_score([reference.split()], candidate.split())
```

## CIDEr (Consensus-based Image Description Evaluation) 评价指标

### 基本概念

CIDEr是专门为图像描述生成任务设计的评估指标，通过比较机器生成的描述与多个人工参考描述的相似度来评估质量。

### 核心算法

1. **TF-IDF 向量表示**
$$ g_k(s) = \frac{h_k(s)}{\underbrace{||s||}_{\text{归一化因子}}} \times \underbrace{\log\left(\frac{|I|}{\sum_{I_i\in I}\min(1,h_k(s_i))}\right)}_{\text{跨图像IDF}} $$

2. **余弦相似度计算**
$$ \text{CIDEr}_n(c,S) = \frac{1}{m}\sum_{j=1}^m \underbrace{\frac{g_n(c)\cdot g_n(s_j)}{||g_n(c)||\cdot||g_n(s_j)||}}_{\text{余弦相似度}} $$

3. **多粒度融合**
$$ \text{CIDEr}(c,S) = \sum_{n=1}^4 \underbrace{w_n}_{\text{权重}} \text{CIDEr}_n(c,S) $$

**计算过程**：
1. 将候选描述$c$和每个参考描述$s_j$表示为TF-IDF向量
2. 计算向量间的余弦相似度
3. 对所有参考描述取平均

**参数说明**：
* $h_k(s)$：句子$s$中k-gram的出现次数
* $||s|| = \sqrt{\sum_k h_k(s)^2}$：欧几里得范数归一化
* $|I|$：数据集中图像总数
* $\min(1,h_k(s_i))$：二进制化处理（存在性判断）

**典型设置**：
- $w_1=w_2=w_3=w_4=0.25$（等权重）
- n-gram范围：1-gram到4-gram

### 特点

#### 优势
- ✅ 对描述特异性敏感
- ✅ 自动降低常见词权重
- ✅ 支持多参考描述评估
- ✅ 与人类评估高度相关(相关系数0.9+)

#### 劣势
- ❌ 计算复杂度较高
- ❌ 需要足够多的参考描述
- ❌ 对领域变化敏感

### 实现
```python
from pycocoevalcap.cider.cider import Cider

references = [['a cat sits on the mat'], ['there is a cat on the mat']]
candidate = ['the cat is sitting on the mat']

scorer = Cider()
score, _ = scorer.compute_score(references, candidate)
```