---
title: Audio Flamingo
author: saber5203
date: 2025-04-08
category: paper_reading
layout: post
---

[前置论文Flamingo解读](https://zhuanlan.zhihu.com/p/685233706)

## Audio Flamingo V1[<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="2 -5 24 24" width="24px" fill="#4B77D1"><g><rect fill="none" height="24" width="24"/></g><g><polygon points="6,6 6,8 14.59,8 5,17.59 6.41,19 16,9.41 16,18 18,18 18,6"/></g></svg>](https://arxiv.org/abs/2402.01831)

![V1论文](../images/Audio-Flamingo/V1论文.png)

### 概述

`Audio Flamingo`是一种音频语言模型，旨在增强大型语言模型（LLMs）对音频的理解能力，包括**非语音声音**和**非言语语音**。

该模型具有以下核心特点：
* **强大的音频理解能力**：能够处理多种音频任务，如音频字幕`CAP`、音频问答`AQA`和音频分类`CLS`。
* **少样本学习能力**：通过上下文学习`ICL`和检索增强生成`RAG`快速适应新任务，无需微调。
* **多轮对话能力**：支持复杂的多轮对话，能够理解上下文并生成连贯的回复。

`Audio Flamingo`在参数量仅为其他模型（例如`Qwen-audio`）的1/3的情况下实现了相似性能。

![V1性能](../images/Audio-Flamingo/V1性能.png)

解决的核心问题：
* **从变长音频中提取特征，并对`LM`进行音频特征的调整**：引入了一种基于Elizalde等人(2023b)的滑动窗口音频特征提取器，能更好地捕捉时间信息。对于将音频`token`输入到`LM`中，先前模型在音频`token`前后添加了特殊标记（例如`Qwen-audio`的`<|Audio|>`和`<|/Audio|>`标记）并将其混合到文本`token`中。这种方法对于长音频可能会有过高的开销，因为其复杂性与音频标记的数量呈二次方关系。相比之下，作者使用**交叉注意力**将音频输入融合到`LM`中，类似于 `Flamingo`(Alayrac 等人，2022)。这种方式的复杂性与音频`token`的数量呈线性关系。
* **数据集与训练**。作者整理了一个包含约590万个音频-文本对的混合数据集。作者采用了一种基于广泛采用且稳定的方法来训练`LLMs`(Ouyang 等，2022)，具体分为两个训练阶段：预训练和监督微调，每个阶段都有不同的子集和训练技术。
* **赋予音频语言模型无需微调快速适应新任务的能力**：作者实现了一种高效的检索方法，引入了`ICL`模板，并使用检索到的样本创建交错`ICL`数据集进行训练。此外，作者还引入了一种新颖的**交错样本交叉注意力掩码**。
* **赋予音频语言模型与用户进行多轮对话的能力**。作者创建了两个基于`GPT-4`的多轮对话数据集，通过在这些数据集上微调`Audio Flamingo`来获得一个聊天模型。

[代码仓库](https://github.com/NVIDIA/audio-flamingo/) & [演示Demo](https://audioflamingo.github.io/)

### 模型架构

![V1架构](../images/Audio-Flamingo/V1架构.png)

Audio Flamingo 的架构包含四个主要组件：
- **音频特征提取器**：使用`ClapCap`（Elizalde 等，2023b）作为音频特征提取器的主干。`ClapCap`被硬编码为以7秒的44.1kHz原始音频作为输入，然后将音频转换为跳长为320、窗口长度为1024、64维的Mel频谱图，最后输出一个1024维度的向量表示。每7秒的片段视为一个窗口，并使用滑动窗口从较长的音频中提取特征，连续窗口之间的重叠为`7×0.75=5.25`秒。这种设计的直觉是为了捕捉在单个融合表示向量中可能被忽略的长距离和时间信息。使用最多 16个滑动窗口，因此支持最多33.25秒的音频长度。
- **音频表示转换层**：通过进一步应用几个音频表示变换层于来增加模型容量。音频表示变换层由3个自注意力层组成，每个层有8个头和2048的内部维度。此模块是可训练的。
- **语言模型**：使用OPT-IML-MAX-1.3B作为解码器，这是一个具有1.3B参数和24个LM块的模型。它已在许多自然语言任务上进行指令微调。
- **条件融合层**：通过交叉注意力将音频输入与语言模型融合。使用`Flamingo`（Alayrac 等，2022）中的`gated xattn-dense`层来实现对音频输入的条件化。每一层包含两个模块：一个带有交叉注意力和`tanh`门控的残差块和一个带有密集层和`tanh`门控的残差块。这些层被添加到每个`LM`模块之前。

### 核心算法

#### 数据集

作者将音频数据分为通用音频(场景音等)、音乐和语音，将数据集分为三种类型的任务：
* 音频字幕（CAP）——希望模型用一句话描述音频；
* 音频问答（AQA）——希望模型回答有关音频的问题；
* 音频分类（CLS）——希望模型将声音分类为与事件、场景、音乐流派、乐器、品质等相对应的一个或多个标签。

以下是作者用到的所有数据集

![V1数据集](../images/Audio-Flamingo/V1数据集.png)

#### 单一样本训练

对于每一个数据集中的每个单一样本，作者构建对话模板如下：（Options仅出现在音频分类样本中）

```chattemplate
    <s>{task description}<audio>{instruction}
    [Options:\n- option-1\n···- option-m]
    <SEP>{output}<EOC></s>
```

使用最大似然估计（MLE）来训练模型，损失定义为：

$$
\mathcal{L}(\mathbf{z}) = \sum_{t=1}^{|\mathbf{y}_{\text{out}}|} \log p_{\theta} \left( (\mathbf{y}_{\text{out}})_t \mid \mathbf{x}, \mathbf{y}_{\text{ins}}, (\mathbf{y}_{\text{out}})_{<t} \right).
$$

其中：
* $\mathbf{x}$ 为单通道音频，$\mathbf{y}_{\text{ins}}$ 为指令文本，$\mathbf{y}_{\text{out}}$ 为输出文本
* $\mathbf{z} = (\mathbf{x}, \mathbf{y}_{\text{ins}}, \mathbf{y}_{\text{out}})$ 来表示一个单一样本
* $(\mathbf{y}_{\text{out}})_{t}$ 为第 t个`token`， $(\mathbf{y}_{\text{out}})_{<t}$ 为前t-1个`token`

#### 交错样本构建与训练

交错样本构建是`ICL`的基础，也是模型`RAG`能力的来源。

作者基于**音频嵌入**的$k$-NN计算为每个原始数据集构建`ICL`数据集。

设$\mathcal{D}^i$为第i个训练数据集。对于每个$\mathbf{z} = (x, y_{\text{ins}}, y_{\text{out}}) \in \mathcal{D}^i$，在$\mathcal{D}^i$中找到其最接近的k个训练样本（除 $\mathbf{z}$本身），其中距离函数定义为样本的音频部分在`fused LAION-CLAP`嵌入空间（Wu 等人，2023）中的L2范数。作者使用`Faiss-gpu`（Johnson 等人，2019）来加速搜索。整体过程入下所示：

![V1交错样本构建](../images/Audio-Flamingo/V1交错样本构建.png)

对于交错样本，作者构建对话模板如下：（Options仅出现在音频分类样本中）

```chattemplate
    <s>{task description}Here are similar samples.
    <audio>{instruction1}<SEP>{output1}<EOC>
    · · ·
    <audio>{instructionk}<SEP>{outputk}<EOC>
    <audio>{instruction}
    Options:\n- option1\n···- optionm
    <SEP>{output}<EOC></s>
```

对于交错样本的交叉注意力计算，作者设计了一种**交叉注意力掩码**（类似`Flamingo`的做法）。

对于交错样本，作者使用块上三角交叉注意力掩码，以便第$j$个输出$P_{\theta}(y^j_{\mathrm{out}})$的似然性仅受前$j$个音频输入$x^{\leq j}$的影响。交叉注意力掩码如下所示：

![V1交叉注意力掩码](../images/Audio-Flamingo/V1交叉注意力掩码.png)

对于由$J$个样本
$z_{\text{int}} = \{z^1, \cdots, z^J\}$
组成的交错样本，其中
$z^j = (x^j, y^j_{\text{ins}}, y^j_{\text{out}})$，
对数似然是在所有输出上计算的：

$$
\mathcal{L}_{\text{int}}(z_{\text{int}} = \{z^1, \cdots, z^J\}) = \sum_{j=1}^J \sum_{t=1}^{|y^j_{\text{out}}|} \log P_\theta \left( (y^j_{\text{out}})_t \mid z^{<j}, x^j, y^j_{\text{ins}}, (y^j_{\text{out}})^{<t} \right).
$$

这种交错损失与先前模型不同，先前模型仅在最后一个输出 $y_{\text{out}}^J$ 上计算损失，或者没有将先前的多模态输入 $x^{<j}$ 作为模型预测条件（例如`Flamingo`的交叉注意力仅计算最近的前一个图片）。作者期望上述损失函数可以帮助模型查看各种数量的`ICL`样本（包括当 $j = 1$ 时为零）以及相关的音频，从而提高鲁棒性和训练效率，尤其是在检索到类似样本的`ICL`样本时。

#### 整体训练架构

#### 多轮对话微调

## Audio Flamingo V2[<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="2 -5 24 24" width="24px" fill="#4B77D1"><g><rect fill="none" height="24" width="24"/></g><g><polygon points="6,6 6,8 14.59,8 5,17.59 6.41,19 16,9.41 16,18 18,18 18,6"/></g></svg>](https://arxiv.org/abs/2503.03983)

![V2论文](../images/Audio-Flamingo/V2论文.png)