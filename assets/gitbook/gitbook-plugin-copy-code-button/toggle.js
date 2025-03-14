require(["gitbook", "jquery"], function (gitbook, $) {
    function selectElementText(el) {
        var range = document.createRange();
        range.selectNodeContents(el);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    function getSelectedText() {
        var t = '';
        if (window.getSelection) {
            t = window.getSelection();
        } else if (document.getSelection) {
            t = document.getSelection();
        } else if (document.selection) {
            t = document.selection.createRange().text;
        }
        return t;
    }

    function copyToClipboard(text) {
        if (window.clipboardData && window.clipboardData.setData) {
            // IE specific code path to prevent textarea being shown while dialog is visible.
            return clipboardData.setData("Text", text);

        } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
            var textarea = document.createElement("textarea");
            textarea.textContent = text;
            textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
            document.body.appendChild(textarea);
            textarea.select();
            try {
                return document.execCommand("copy");  // Security exception may be thrown by some browsers.
            } catch (ex) {
                console.warn("Copy to clipboard failed.", ex);
                return false;
            } finally {
                document.body.removeChild(textarea);
            }
        }
    }

    function expand(chapter) {
        chapter.show();
        if (chapter.parent().attr('class') != 'summary'
            && chapter.parent().attr('class') != 'book-summary'
            && chapter.length != 0
        ) {
            expand(chapter.parent());
        }
    }

    gitbook.events.bind("page.change", function () {
        $("pre").each(function () {
            $(this).css({"position": "relative", "display": "flex", "flex-direction": "column-reverse"});
    
            // 创建包裹按钮的容器
            var $markdownheader = $('<div class="markdown-header"></div>');
            $markdownheader.css({
                "display": "flex",
                "justify-content": "space-between",
                "height": "30px"
            });
            
            // 获取语言名称
            var $languageDiv = $(this).closest('div[class*="language-"]'); // 定位最近的包含language-类名的div
            var language = 'Code'; // 默认值
            if ($languageDiv.length) {
                var classes = $languageDiv.attr('class').split(/\s+/);
                for (var i = 0; i < classes.length; i++) {
                    var cls = classes[i];
                    if (cls.startsWith('language-')) {
                        var langPart = cls.split('-')[1]; // 提取语言部分（如typescript）
                        if (langPart) {
                            // 首字母大写处理
                            language = langPart.charAt(0).toUpperCase() + langPart.slice(1);
                        }
                        break;
                    }
                }
            }
            var $languagename = $('<p class="language-name"></p>').text(language); // 动态设置语言名称

            var $copyCodeButton = $("<button class='copy-code-button'>Copy</button>");
            $copyCodeButton.css({ 
                "padding": "3px", 
                "background-color": "#313E4E", 
                "color": "white", 
                "border-radius": "5px", 
                "-moz-border-radius": "5px", 
                "-webkit-border-radius": "5px", 
                "border": "2px solid #CCCCCC",
                "cursor": "pointer" // 添加手型指针
            });
    
            $copyCodeButton.click(function () {
                var $codeContainer = $(this).siblings("code");
                console.log($codeContainer)
                if ($codeContainer) {
                    selectElementText($codeContainer.get(0));
                    var selectedText = getSelectedText();

                    var buttonNewText = "";
                    if (copyToClipboard(selectedText) == true) {
                        buttonNewText = "Copied";
                        selectElementText($codeContainer.get(0));
                    } else {
                        buttonNewText = "Unable to copy";
                        selectElementText($codeContainer.get(0));
                    }

                    $(this).text(buttonNewText);
                    var that = this;
                    setTimeout(function () {
                        $(that).text("Copy");
                    }, 2000);
                }
            });

            $markdownheader.append($languagename);
            $markdownheader.append($copyCodeButton);
            $(this).append($markdownheader);
        });
    });
});
