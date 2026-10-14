# 环境安装与工具准备类：完整写法模板

## 模板说明

这是一份完整正文样例，用来观察环境准备章节怎样从最终验收结果出发，带领零基础学习者完成安装、配置、核验和排错。它适合 JDK、IDE、构建工具、数据库、容器、命令行工具等需要在本机得到确定结果的主题。

阅读时重点观察：

- 开头先给出完成标准，让学习者知道环境可用时会看到什么。
- 工具首次出现时解释用途和彼此关系，再进入下载与安装。
- macOS 与 Windows 分别提供完整路径，下载入口直接放在对应步骤中。
- 每个阶段都有命令输出、生成文件或 IDE 控制台等可观察结果。
- 排错按依赖顺序推进，避免学习者同时修改多个设置。
- 最后用验收记录确认环境能支持下一章，而不是以“安装完成”作为结束。

不要照搬本例中的 JDK 版本、工具选型、命令、下载链接、目录和章节编号。生成新课程时，必须根据课程 spec、目标操作系统和最新官方资料重新核验。正文也不必复用本例的小节数量；只保留当前环境任务真正需要的步骤和解释。

下面保留完整样例正文，供校准操作粒度、解释密度和核验节奏。

---

# 第 2 章　JDK 17、IDE 与 Maven 环境核验

> 学习提示：本章同时给出 macOS 与 Windows 路径。严格按“安装 JDK → 终端核验 → 安装 IDE → 安装 Maven → 运行同一程序”的顺序操作；任何一步失败都先停下来排查。
> 一句话总结：一套可用的 Java 开发环境需要 JDK 17、用于写和调试代码的 IDE、用于构建项目的 Maven，并且三者必须指向同一套 Java 17。

## 一、先看本章完成后的结果

完成本章后，你的电脑应能完成下面三件事：

1. 在终端执行 `java -version` 和 `javac -version`，都显示 Java 17。
2. 在 IntelliJ IDEA 中新建并运行一个 Java 程序。
3. 在终端执行 `mvn -v`，其中的 Java version 也是 17；随后用 Maven 编译同一个程序。

这三个结果缺一不可。只在 IDE 中点击“运行”成功，还不能说明 Maven 和终端环境正确；只在终端能运行，也不代表 IDE 的项目设置正确。

## 二、开始前认识三个工具

这一章会出现三个工具。先分清它们的角色，安装时才不会把其中一个误当成全部环境。

| 工具 | 解决什么问题 | 本章的使用方式 |
| --- | --- | --- |
| [[JDK]] 17 | 提供 Java 编译器、运行命令和标准库 | 编译、运行 Java 程序 |
| [[IDE]] | 提供编辑器、代码提示、运行、调试和项目管理界面 | 编写并运行程序 |
| [[Maven]] | 根据项目规则下载依赖、编译、测试和打包 | 在终端构建 Java 项目 |

[[JVM]]是运行 Java class 文件的环境。它随着 JDK 一起安装。`java` 是启动程序的命令，`javac` 是编译源文件的命令；现在不用记住 class 文件的细节，第 3 章会展开。

## 三、安装 JDK 17

本课程以 JDK 17 为可运行基线。不要先安装“最新 Java”再猜它是否兼容课程；先明确选择 17，后面遇到 JDK 21+ 的新能力时会单独说明。

### 3.1 macOS 安装 JDK 17

下面提供两条 macOS 路径。没有 Homebrew、第一次配置开发环境的学习者，请使用路径 A；已经熟悉 Homebrew 的学习者可以使用路径 B。二选一即可。

#### 3.1.1 从 Adoptium 下载图形安装包

Adoptium 是提供 OpenJDK 构建发行版的项目。本课程建议从 [Eclipse Adoptium Temurin 17 下载页](https://adoptium.net/temurin/releases/?version=17) 下载 Temurin 17。

1. 打开该下载页。
2. 在版本中选择 **17**。
3. 操作系统选择 **macOS**。
4. 选择与你的 Mac 匹配的架构：Apple 芯片的 Mac 选 **AArch64 / ARM64**；Intel 芯片的 Mac 选 **x64**。
5. 下载扩展名为 `.pkg` 的安装包。
6. 双击下载的 `.pkg` 文件，按 macOS 安装器提示继续，通常保持默认安装位置即可。

不知道自己的 Mac 使用哪种芯片时，点击屏幕左上角苹果菜单，选择“关于本机”：看到 Apple M 系列芯片时选 AArch64；看到 Intel 时选 x64。架构选错时，安装或运行可能失败，不要尝试用 IDE 设置绕过去。

安装完成后，关闭当前终端并重新打开一个新的终端窗口。接着进入下一节执行版本核验。

#### 3.1.2 已安装 Homebrew 时使用命令行安装

[[Homebrew]]是 macOS 常用的软件包管理工具。如果你在终端执行下面的命令能看到版本号，说明已经安装：

```bash
brew -v
```

此时可以安装 JDK 17：

```bash
brew install --cask temurin@17
```

命令完成后，重新打开终端，再执行下一节的版本核验。

如果 `brew -v` 提示找不到命令，不必为了这一章额外学习 Homebrew；回到路径 A 下载 `.pkg` 安装包即可。路径 A 对第一次安装 Java 的读者更直接。

### 3.2 Windows 安装 JDK 17

Windows 学习者同样从 [Eclipse Adoptium Temurin 17 下载页](https://adoptium.net/temurin/releases/?version=17) 下载，步骤如下：

1. 在版本中选择 **17**，操作系统选择 **Windows**。
2. 大多数普通 Windows 笔记本或台式机选择 **x64**；只有明确使用 ARM 版 Windows 的电脑才选择 **AArch64 / ARM64**。可在“设置 → 系统 → 系统信息 → 系统类型”查看。
3. 下载 `.msi` 安装包，双击后按安装向导继续。首次安装保持默认安装目录即可。
4. 安装程序出现“设置 JAVA_HOME”或“添加到 PATH”一类选项时，保持勾选。
5. 安装结束后，关闭已打开的 PowerShell 或命令提示符窗口，再重新打开一个窗口。

如果重新打开 PowerShell 后仍提示找不到 `java`，先在资源管理器中确认 JDK 已安装。常见安装目录位于 `C:\Program Files\Eclipse Adoptium\` 下，但具体文件夹名称会带有补丁版本。找到其中的 `bin` 目录后，再按“按顺序排查版本不一致”一节补充 PATH 与 `JAVA_HOME`；不要把带有 `bin` 的路径直接填进 `JAVA_HOME`。

## 四、在终端确认 Java 17

macOS 打开“终端”；Windows 打开 PowerShell 或命令提示符。依次执行：

```bash
java -version
javac -version
```

两条输出都应显示 17。例如，`javac -version` 的结果通常类似：

```text
javac 17.0.x
```

其中 `x` 是 JDK 17 的补丁版本，数字不必与示例完全相同。关键是主版本为 17。

如果命令提示找不到 `java` 或 `javac`，先确认 JDK 安装程序已经结束，然后关闭并重新打开终端。macOS 可以用下面的命令查看系统已经识别到的 JDK：

```bash
/usr/libexec/java_home -V
```

输出中应有一个包含 `17` 的条目。需要在当前终端临时选择它时，执行：

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH="$JAVA_HOME/bin:$PATH"
```

再重新执行 `java -version` 与 `javac -version`。这两行只影响当前终端窗口；不要在还没确认成功前，把它们复制到多个 shell 配置文件中。

Windows 可以先执行下面两条命令，查看系统准备执行哪个程序：

```powershell
Get-Command java
Get-Command javac
```

如果它们没有指向 JDK 17，可在“编辑系统环境变量 → 环境变量”中设置：

- `JAVA_HOME`：JDK 17 的根目录，例如 `C:\Program Files\Eclipse Adoptium\jdk-17...`，不包含末尾的 `bin`。
- `Path`：新增 `%JAVA_HOME%\bin`。

保存后必须关闭并重新打开 PowerShell，再执行版本命令。环境变量的具体 JDK 文件夹名称会随补丁版本变化，应以自己电脑上的实际目录为准。

### 4.1 用最小程序确认编译与运行

在任意便于找到的位置新建一个文件夹，例如 macOS 的“文稿”目录或 Windows 的“文档”目录中的 `java-learning/chapter-02`。在其中新建文件 `HelloJava.java`，内容如下：

```java
public class HelloJava {
    public static void main(String[] args) {
        System.out.println("Java 17 environment is ready.");
    }
}
```

文件名必须是 `HelloJava.java`，并与代码中的 `HelloJava` 保持一致。暂时不需要理解 `public`、`class` 和 `main` 的完整含义；这一节只验证 JDK 能把源文件编译并运行。

在该文件夹的终端执行：

```bash
javac HelloJava.java
java HelloJava
```

第一条命令成功后会多出 `HelloJava.class`。第二条命令应输出：

```text
Java 17 environment is ready.
```

运行命令中只写类名 `HelloJava`，不要写成 `java HelloJava.java` 或 `java HelloJava.class`。第 3 章会解释编译和运行的分工。

## 五、认识 IDE 与 Java 开发工具

IDE 是“集成开发环境”的缩写。不同语言的 IDE 外观不同，但它们通常把多个开发动作放到一个程序里：编辑代码、识别错误、跳转到定义、运行、调试、管理项目文件和执行构建工具。

Java 项目会涉及多个源文件、包目录、Maven 配置和依赖。只用普通文本编辑器当然也能写 Java，但你需要自己完成更多路径、编译和运行设置。对刚开始学习 Java 的人，IDE 能把注意力放在代码和错误信息上，而不是在文件位置之间来回猜测。

本课程默认推荐 **IntelliJ IDEA**。它对 Java、Maven 和 Spring Boot 的项目结构支持完整，后续章节的路径说明也会优先采用它的界面名称。IntelliJ IDEA 同时支持 macOS 与 Windows，界面中的项目设置名称基本一致。

### 5.1 常见 Java 开发工具的选择

| 工具 | 适合谁 | 优点 | 需要注意的地方 |
| --- | --- | --- | --- |
| IntelliJ IDEA | 本课程的默认选择；希望长期做 Java 后端开发的人 | Java 项目、Maven、调试、重构和 Spring 相关工作集中在同一界面 | 占用内存相对较多；部分高级功能需要 Ultimate 订阅 |
| VS Code + Java 扩展包 | 已经非常熟悉 VS Code、希望先复用现有编辑器的前端工程师 | 轻量，界面熟悉，安装 Java 扩展后可运行、调试和管理 Maven 项目 | Java 能力由多个扩展组成，项目设置分散；跟随本课 IDE 步骤时需要自行对照菜单 |
| Eclipse IDE | 已在公司或旧项目中使用 Eclipse 的人 | 免费、成熟，Java 生态历史悠久 | 界面、快捷键和项目配置与本课默认工具不同，首次学习时不建议同时学习两套操作方式 |

IntelliJ IDEA 目前使用统一下载包：核心 Java/Kotlin 功能可以免费使用，安装后会提供 Ultimate 功能的试用；试用结束后仍可继续使用免费核心功能。不要为了本课程先购买订阅。

### 5.2 安装 IntelliJ IDEA

1. 打开 [IntelliJ IDEA 下载页](https://www.jetbrains.com/idea/download/)。
2. macOS 选择 **macOS**，再选择与电脑匹配的 Apple Silicon 或 Intel 安装包；下载 `.dmg` 后，双击打开并把 IntelliJ IDEA 拖入 Applications（应用程序）文件夹。
3. Windows 选择 **Windows**，下载 `.exe` 安装程序；双击后按安装向导完成安装，默认选项即可。
4. 从“应用程序”或 Windows 开始菜单启动 IntelliJ IDEA。首次启动时接受默认设置即可；不需要导入其他 IDE 的配置。
5. 在欢迎页选择 **New Project**。
6. 左侧选择 **Java**。在 JDK 或 Project SDK 下拉框中选择刚才安装的 **17**。
7. 不勾选任何额外框架或示例，创建一个空 Java 项目。
8. 在 `src` 目录下新建 `HelloJava` 类，粘贴上一节的代码，然后点击 `main` 方法旁的运行图标。

IDE 控制台中应看到同样的输出：

```text
Java 17 environment is ready.
```

如果创建项目时没有看到 JDK 17，点击添加 JDK 的选项，选择 JDK 的安装目录。不要选择 IDE 自己运行时附带的 Java，也不要在项目语言级别中选择高于 17 的版本。

### 5.3 选择 VS Code 时需要额外完成的设置

若你决定继续用 VS Code，请按 [VS Code Java 入门](https://code.visualstudio.com/docs/java/java-tutorial) 的官方步骤安装 **Extension Pack for Java**。它包含 Java 语言支持、调试器、测试、Maven 和项目管理扩展。

VS Code 的 Coding Pack 可能会同时安装一个 JDK。由于本课程固定使用 JDK 17，建议先按前面的步骤安装并核验 JDK 17，再在 VS Code 中把项目运行时设为这套 JDK。不要因为 VS Code 能运行某个程序，就跳过 `java -version` 与 `javac -version`。

## 六、安装 Maven

Maven 负责读取 `pom.xml`，下载项目依赖，并执行编译、测试、打包等构建任务。后续 Spring Boot 项目会使用 Maven，所以本章必须让终端能够找到 `mvn` 命令。

### 6.1 macOS 安装 Maven

对 macOS 新手，最短的安装路径是使用 Homebrew：

```bash
brew install maven
mvn -v
```

如果此前没有安装 Homebrew，请先阅读 [Homebrew 官网](https://brew.sh/) 的安装说明，再决定是否安装。完成 Homebrew 安装后，重新打开终端，再执行上面两行命令。

不想安装 Homebrew 时，可以从 [Apache Maven 下载页](https://maven.apache.org/download.cgi) 下载 Binary tar.gz 压缩包。解压后，需要把 Maven 的 `bin` 目录加入 PATH。这条路径的每台电脑都不同，因此不要从网上复制一个不属于自己电脑的 `MAVEN_HOME`；以你解压后的目录为准。对第一次配置环境的学习者，使用 Homebrew 会少掉这一步路径配置。

### 6.2 Windows 安装 Maven

Windows 上建议使用 [Apache Maven 下载页](https://maven.apache.org/download.cgi) 提供的 Binary zip 压缩包：

1. 下载 Binary zip，不要下载 Source zip。
2. 解压到一个不会随意删除的位置，例如 `C:\tools\apache-maven-版本号`。
3. 打开“编辑系统环境变量 → 环境变量”。新建系统变量 `MAVEN_HOME`，值为刚才的 Maven 根目录，不包含 `bin`。
4. 编辑系统变量 `Path`，新增 `%MAVEN_HOME%\bin`。
5. 关闭并重新打开 PowerShell，执行 `mvn -v`。

如果 `mvn -v` 能显示 Maven 版本却提示 Java 版本不是 17，Maven 已经安装成功，但 JDK 选择不正确；回到 `JAVA_HOME` 和 PATH 的检查，不要重新解压 Maven。

执行 `mvn -v` 后，检查输出中的两项：

```text
Apache Maven ...
Java version: 17...
```

如果 Maven 能运行但 Java version 不是 17，Maven 正在使用另一套 JDK。不要继续创建项目，先回到“按顺序排查版本不一致”一节。

## 七、用 Maven 编译同一个程序

现在创建一个 Maven 项目目录：

```text
chapter-02-maven/
├── pom.xml
└── src/
    └── main/
        └── java/
            └── com/
                └── example/
                    └── HelloJava.java
```

把上一节的程序放到 `src/main/java/com/example/HelloJava.java`，在第一行加上包名：

```java
package com.example;

public class HelloJava {
    public static void main(String[] args) {
        System.out.println("Maven uses Java 17.");
    }
}
```

然后在项目根目录创建 `pom.xml`：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>chapter-02-maven</artifactId>
    <version>1.0.0</version>

    <properties>
        <maven.compiler.release>17</maven.compiler.release>
    </properties>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.14.1</version>
            </plugin>
        </plugins>
    </build>
</project>
```

`maven.compiler.release` 表示按 Java 17 的语言和 API 基线编译。现在不需要背诵 XML；它只是让 Maven 与前面已经核验的 JDK 17 对齐。

在包含 `pom.xml` 的目录执行：

```bash
mvn compile
java -cp target/classes com.example.HelloJava
```

第二条命令应输出：

```text
Maven uses Java 17.
```

这说明终端 JDK、IDE 项目 JDK 和 Maven 编译基线已经完成同一轮核验。

## 八、按顺序排查版本不一致

环境出现问题时，不要同时修改所有设置。按下表从外到内排查：

| 现象 | 先检查什么 | 下一步 |
| --- | --- | --- |
| `java` 或 `javac` 找不到 | JDK 安装是否完成，是否重新打开终端 | 执行 `/usr/libexec/java_home -V`，再检查 PATH |
| `java -version` 与 `javac -version` 不一致 | `which java` 与 `which javac` | 重新选择同一套 JDK 的 bin 目录 |
| 终端正确，IDE 错误 | 项目 SDK、语言级别、运行配置 | 删除旧运行配置后重新选择 JDK 17 |
| 终端正确，`mvn -v` 错误 | Maven 输出的 Java home | 检查 `JAVA_HOME`、IDE 的 Maven Runner 设置 |
| Maven 编译提示版本过高或过低 | `pom.xml` 的 compiler release | 统一设为 17 后重新执行 `mvn compile` |

提问或搜索错误时，附上操作系统、`java -version`、`javac -version`、`mvn -v` 与完整报错，比只说“Java 配不好”更容易定位问题。

## 九、本章验收记录

完成后填写这张表。它也是后续排查项目环境的起点。

| 核验项 | 你的结果 |
| --- | --- |
| `java -version` |  |
| `javac -version` |  |
| IntelliJ IDEA 项目 SDK | 17 / 待排查 |
| IDE 运行 `HelloJava` | 成功 / 待排查 |
| `mvn -v` 中的 Java version |  |
| 当前操作系统（macOS / Windows） |  |
| Maven `mvn compile` | 成功 / 待排查 |

只有这些项目都确认完成，才算通过本章。此时再进入第 3 章，学习 Java 程序结构、编译和运行的原理。

## 十、常见误区

### 10.1 把 JDK、IDE 和 Maven 当成同一个软件

它们会协作，但负责不同事情。JDK 提供 Java 工具，IDE 提供写代码和调试的界面，Maven 负责构建项目。缺少任何一个，后续学习都会在不同位置中断。

### 10.2 只按教程安装最新版本

Java 项目必须看目标版本。本课程以 17 为主线，所以下载、项目 SDK、Maven 编译基线都应先选 17。以后项目要求 21 时，再按同样方法新增或切换版本。

### 10.3 因为熟悉 VS Code 而跳过 Java 扩展和运行时设置

VS Code 本身不是完整 Java 环境。必须安装 Java 扩展包，并明确项目使用哪一套 JDK。否则同一个项目在命令行和编辑器中可能得到不同结果。

## 十一、本章小结

你已经在 macOS 或 Windows 上建立了 Java 开发最小环境：安装 JDK 17，使用终端编译运行程序，在 IntelliJ IDEA 中使用同一套 JDK，并安装 Maven 完成一次构建。接下来第 3 章会解释这些命令背后的程序结构，而不是继续配置工具。

## 十二、快速自测

1. 为什么要选择与 Mac 芯片类型匹配的 JDK 安装包？
2. IDE 与 JDK 的区别是什么？
3. `mvn -v` 显示 Java 21，而 `java -version` 显示 17 时，应该先做什么？

参考答案：安装包的 CPU 架构必须和电脑匹配；JDK 提供编译和运行工具，IDE 提供集成的编写、运行和调试界面；停止构建，检查 Maven 的 Java home、`JAVA_HOME` 与 IDE 的 Maven Runner，统一到 JDK 17。

## 参考文献

- Eclipse Adoptium. [Temurin 17 下载页](https://adoptium.net/temurin/releases/?version=17).
- JetBrains. [IntelliJ IDEA 下载页](https://www.jetbrains.com/idea/download/).
- JetBrains. [IntelliJ IDEA 安装说明](https://www.jetbrains.com/help/idea/installation-guide.html).
- Microsoft. [VS Code Java 入门](https://code.visualstudio.com/docs/java/java-tutorial).
- Homebrew. [Homebrew 官网](https://brew.sh/).
- Apache Maven. [Maven 下载页](https://maven.apache.org/download.cgi).
- Apache Maven. [Maven Compiler Plugin](https://maven.apache.org/plugins/maven-compiler-plugin/).
