import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  Button,
  Input,
  Textarea,
  ScrollView,
  Image,
  Picker,
  RichText,
} from "@tarojs/components";
import { Popup, Icon } from "@antmjs/vantui";
import { useRequest } from "taro-hooks";
import Taro from "@tarojs/taro";
import { marked } from "marked";
import "./index.scss";

import officeDialog from "@/components/dialog";
import officeToast from "@/components/toast";
import { useAppStore, useSelector } from "@/store";
import {
  _aiChat,
  _aiModels,
  _aiBalance,
  _aiSaveChat,
  _aiChatList,
  _aiDeleteChat,
} from "@/services/ai";

// 配置marked的renderer
const renderer = new marked.Renderer();
renderer.blockquote = ({ raw, text }) => {
  return `<blockquote class="custom-richtext-blockquote">${
    text || raw || ""
  }</blockquote>`;
};
renderer.code = (quote) => {
  const { raw, text, lang } = quote;
  return `<code class="custom-richtext-code code-${lang}">${
    text || raw
  }</code>`;
};
renderer.codespan = ({ raw, text }) => {
  return `<code class="custom-richtext-codespan">${text || raw}</code>`;
};

marked.setOptions({
  renderer,
  //   breaks: true,
  //   gfm: true,
});

interface Message {
  role: "user" | "assistant";
  content: string;
  reasoning_content?: string;
  type?: "success" | "info" | "error" | "warning" | "default";
}

interface ModelOption {
  label: string;
  value: string;
}

const defaultMessages: Message[] = [
  {
    role: "assistant",
    content: "你好，我是你的AI助手，很高兴为您服务。",
    type: "default",
  },
];

const ChatPage = () => {
  const { isDarkMode, setIsDarkMode, userInfo, reset } = useAppStore(
    useSelector(["isDarkMode", "setIsDarkMode", "userInfo", "reset"])
  );
  const scrollViewRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([...defaultMessages]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedScene, setSelectedScene] = useState("general");
  const [isDrawerShow, setIsDrawerShow] = useState(false);
  const [chatId, setChatId] = useState("");
  const [scenes] = useState([
    { label: "通用对话", value: "general", temperature: 1.3 },
    { label: "文案创作", value: "copywriting", temperature: 1.7 },
    { label: "代码助手", value: "coding", temperature: 0.0 },
    { label: "数据分析", value: "analysis", temperature: 1.0 },
  ]);

  //   const models: ModelOption[] = [
  //     { label: 'ChatGPT', value: 'gpt' },
  //     { label: 'DeepSeek', value: 'deepseek' },
  //     { label: '文心一言', value: 'ernie' }
  //   ];

  useEffect(() => {
    console.log("userInfo", userInfo);
    // _aiBalance()
    //   .then((res) => {
    //     console.log(res);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  }, []);

  const { data: models = [] } = useRequest(async () => {
    try {
      const res = await _aiModels();
      const list = (res.data || []).map((item) => ({
        label: item.label,
        value: item.name,
      }));
      setSelectedModel(list[0]?.value || "");
      return list;
    } catch (e) {
      return [];
    }
  });

  // 获取对话记录
  const { data: chatList = [], run: handleGetChat } = useRequest(
    async () => {
      if (!userInfo) return [];
      try {
        const res = await _aiChatList();
        return res.data || [];
      } catch (e) {
        return [];
      }
    },
    {
      manual: true, // 设置为手动触发
    }
  );

  const [currentTypingMessage, setCurrentTypingMessage] =
    useState<Message | null>(null);
  const [displayedContent, setDisplayedContent] = useState(""); // 用于显示逐字显示的内容
  const [displayedReasoning, setDisplayedReasoning] = useState(""); // 用于显示逐字显示的推理内容

  //   文字逐字显示
  useEffect(() => {
    if (currentTypingMessage) {
      let index = 0;
      const content = currentTypingMessage.content;
      const reasoningContent = currentTypingMessage.reasoning_content;
      let contentTimer: NodeJS.Timer | null = null;

      // 如果有推理内容，先显示推理内容
      if (reasoningContent) {
        const timer = setInterval(() => {
          if (index < reasoningContent.length) {
            setDisplayedReasoning((prev) => {
              const newPrev = prev + reasoningContent[index];
              index++;
              return newPrev;
            });
            // index++;
          } else {
            clearInterval(timer);
            index = 0;
            contentTimer = setInterval(() => {
              if (index < content.length) {
                setDisplayedContent((prev) => {
                  const newPrev = prev + content[index];
                  index++;
                  return newPrev;
                });
              } else {
                setCurrentTypingMessage(null);
                setDisplayedContent("");
                setDisplayedReasoning("");
                if (contentTimer) clearInterval(contentTimer);
              }
            }, 50);
          }
        }, 50);

        return () => {
          clearInterval(timer);
          if (contentTimer) clearInterval(contentTimer);
        };
      } else {
        const timer = setInterval(() => {
          if (index < content.length) {
            setDisplayedContent((prev) => {
              const newPrev = prev + content[index];
              index++;
              return newPrev;
            });
          } else {
            setCurrentTypingMessage(null);
            setDisplayedContent("");
            clearInterval(timer);
          }
        }, 50);
        return () => clearInterval(timer);
      }
    }
  }, [currentTypingMessage]);

  //   useEffect(() => {
  //     Taro.nextTick(() => {
  //       // 方式一：使用 pageScrollTo
  //       Taro.pageScrollTo({
  //         selector: `#msg-${messages.length - 1}`,
  //         duration: 0,
  //       });
  //     });
  //   }, [displayedContent, displayedReasoning, messages]);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim()) return;

    const token = Taro.getStorageSync("token");
    if (!userInfo || !token) {
      officeDialog({
        title: "温馨提示",
        content: "亲，请先登录才可以使用哦~",
        confirmText: "确定",
        textCenter: true,
        confirm: () => {
          Taro.navigateTo({
            url: "/pages/login/index",
          });
        },
      });
      return;
    }

    const newMessage: Message = {
      role: "user",
      content: inputValue,
    };
    // 发送给接口的消息
    const sendMessages = messages
      .filter((m) => m.type !== "error" && m.type !== "default")
      .map((item) => ({ role: item.role, content: item.content }));
    sendMessages.push(newMessage);

    setInputValue("");
    setMessages((prev) => [
      ...prev,
      newMessage,
      {
        role: "assistant",
        content: "请求处理中，请稍等...",
      },
    ]);
    setIsLoading(true);
    try {
      const res = await _aiChat({
        model: selectedModel,
        messages: sendMessages,
        chat_id: chatId,
      });
      console.log(res);
      setIsLoading(false);
      if (res.code === 200) {
        const { message } = res.data || {};
        if (message) {
          setCurrentTypingMessage(message);
        } else {
          officeToast.warning("请求失败");
        }
        setMessages((prev) => {
          const newPrev = [...prev];
          newPrev.pop();
          message && newPrev.push(message);
          handleSaveChat(newPrev);
          return newPrev;
        });
      } else {
        officeToast.warning(res.message || "请求失败");
        setMessages((prev) => {
          const newPrev = [...prev];
          newPrev.pop();
          newPrev.push({
            role: "assistant",
            content: "请求异常，请稍后重试~",
            type: "error",
          });
          return newPrev;
        });
      }
    } catch (error) {
      setIsLoading(false);
      officeToast.error(error.message || "请求失败");
      setMessages((prev) => {
        const newPrev = [...prev];
        newPrev.pop();
        newPrev.push({
          role: "assistant",
          content: "请求异常，请稍后重试~",
          type: "error",
        });
        return newPrev;
      });
    }
  }, [inputValue, selectedModel]);

  const handleSaveChat = (newPrev: Message[]) => {
    setTimeout(async () => {
      _aiSaveChat({
        chat_id: chatId,
        messages: newPrev.filter(
          (m) => m.type !== "error" && m.type !== "default"
        ),
        model: selectedModel,
      })
        .then((res) => {
          if (res.code === 200) {
            !chatId && setChatId(res.data?.chat_id);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }, 10);
  };

  const handleModelChange = (e) => {
    initNewChat(models[e.detail.value].value);
  };

  const initNewChat = (model?: string) => {
    setSelectedModel(model || selectedModel || models[0].value);
    setChatId("");
    setMessages([...defaultMessages]);
  };

  const handleSceneChange = (e) => {
    console.log(e);
    setSelectedScene(scenes[e.detail.value].value);
  };

  const toggleDrawer = useCallback(() => {
    setIsDrawerShow((prev) => {
      if (!prev) {
        handleGetChat();
      }
      return !prev;
    });
  }, []);

  const handleUser = () => {
    if (!userInfo) {
      Taro.navigateTo({
        url: "/pages/login/index",
      });
      return;
    }
    officeDialog({
      title: "当前用户昵称为：",
      subTitle: userInfo.username,
      content: `是否退出登录？`,
      textCenter: true,
      confirmText: "确定",
      cancelText: "取消",
      preventLayer: true,
      preventConfirm: true,
      confirm: () => {
        officeDialog.hide();
        toggleDrawer();
        reset();
      },
    });
  };

  const toggleTheme = useCallback(() => {
    setIsDarkMode(!isDarkMode);
  }, [isDarkMode, setIsDarkMode]);

  const handleBackMsg = (index: number, message: Message) => {
    officeDialog({
      title: "撤回提示",
      content: `你确定要撤回这条消息吗？`,
      confirmText: "确定",
      textCenter: true,
      cancelText: "取消",
      confirm: () => {
        setMessages(messages.slice(0, index));
        setInputValue(message.content);
      },
    });
  };

  const handleDeleteChat = (item) => {
    officeDialog({
      title: "删除提示",
      content: `你确定要删除这条聊天记录吗？`,
      confirmText: "确定",
      textCenter: true,
      cancelText: "取消",
      confirm: () => {
        _aiDeleteChat({ chat_id: item.chat_id })
          .then((res) => {
            if (res.code === 200) {
              if (chatId === item.chat_id) {
                initNewChat();
              }
              toggleDrawer();
            } else {
              officeToast.error(res.message || "请求失败");
            }
          })
          .catch((err) => {
            officeToast.error(err.message || "请求失败");
          });
      },
    });
  };

  return (
    <View
      className={`chat-page-wrapper flex flex-col h-screen ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <View
        className={`flex items-center px-4 py-3 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } shadow-sm`}
      >
        <View className="mr-4" onClick={toggleDrawer}>
          <Icon name="wap-nav" size="24" color="#333" />
        </View>
        <View className="flex-1 flex items-center gap-2">
          <View className="flex-1">
            <Picker
              mode="selector"
              range={models}
              rangeKey="label"
              onChange={handleModelChange}
              value={models.findIndex((m) => m.value === selectedModel)}
              className="w-full"
            >
              <View
                className={`flex items-center justify-between py-2 px-3 ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                } rounded-lg`}
              >
                <Text
                  className={`${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {models.find((m) => m.value === selectedModel)?.label ||
                    "选择模型"}
                </Text>
                <Icon
                  name="arrow-down"
                  size="16"
                  color={isDarkMode ? "#999" : "#666"}
                />
              </View>
            </Picker>
          </View>
          <View className="flex-1">
            <Picker
              mode="selector"
              range={scenes}
              rangeKey="label"
              disabled
              onChange={handleSceneChange}
              value={scenes.findIndex((s) => s.value === selectedScene)}
              className="w-full opacity-70"
            >
              <View
                className={`flex items-center justify-between py-2 px-3 ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                } rounded-lg`}
              >
                <Text
                  className={`${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {scenes.find((s) => s.value === selectedScene)?.label ||
                    "选择场景"}
                </Text>
                <Icon
                  name="arrow-down"
                  size="16"
                  color={isDarkMode ? "#999" : "#666"}
                />
              </View>
            </Picker>
          </View>
        </View>
      </View>

      <ScrollView
        className={`scroll-view-wrapper flex-1 px-4 py-2 box-border overflow-auto ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
        ref={scrollViewRef}
        id="scrollViewWrapper"
        scrollY
        scrollWithAnimation
        scrollIntoView={`msg-${messages.length - 1}`}
        enhanced
        bounces={false}
        showScrollbar={false}
      >
        {messages.map((message, index) => (
          <View
            key={index}
            id={`msg-${index}`}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            } mb-4`}
          >
            <View className="flex items-center gap-2 max-w-[80%]">
              {message.role === "user" && index < messages.length - 1 && (
                <Icon
                  name="replay"
                  size="20"
                  color={isDarkMode ? "#666" : "#999"}
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => handleBackMsg(index, message)}
                />
              )}
              <View
                className={`max-w-[100%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-blue-500"
                    : `${
                        isDarkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-white text-gray-800"
                      }`
                } shadow-sm`}
              >
                <RichText
                  user-select
                  nodes={marked.parse(
                    index === messages.length - 1 &&
                      message.role === "assistant" &&
                      currentTypingMessage
                      ? `${
                          displayedReasoning
                            ? `> ${displayedReasoning}\n\n`
                            : ""
                        }${displayedContent || ""}`
                      : `${
                          message.reasoning_content
                            ? `> ${message.reasoning_content}\n\n`
                            : ""
                        }${message.content || ""}`
                  )}
                  className={`text-gray-300 
                    ${message.role === "user" ? "text-white" : ""} 
                        ${message.type === "error" ? "text-red-500" : ""} ${
                    isDarkMode ? "text-gray-300" : "text-gray-800"
                  }`}
                />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View
        className={`p-4 ${isDarkMode ? "bg-gray-800" : "bg-white"} border-t ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        } h-20`}
      >
        <View className="flex items-start gap-2">
          <Textarea
            className={`msg-input flex-1 ${
              isDarkMode
                ? "bg-gray-700 text-gray-300"
                : "bg-gray-100 text-gray-800"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            value={inputValue}
            onInput={(e) => setInputValue(e.detail.value)}
            placeholder="请输入消息..."
          />
          <View className="flex flex-col items-center">
            <Button
              className={`send-btn text-white bg-blue-500 rounded-lg hover:bg-blue-600 active:bg-blue-700 ${
                isLoading ? "opacity-50 pointer-events-none" : ""
              }`}
              onClick={handleSend}
            >
              发送
            </Button>
            <Icon
              name="add"
              size="24px"
              color="rgb(59,130,246)"
              style={{ marginTop: "6px" }}
            />
          </View>
        </View>
      </View>

      <View
        className={`fixed right-4 bottom-36 z-50 w-12 h-12 flex items-center justify-center rounded-full shadow-lg cursor-pointer ${
          isDarkMode
            ? "bg-gray-700 hover:bg-gray-600"
            : "bg-white hover:bg-gray-50"
        }`}
        onClick={() => initNewChat()}
      >
        <Icon name="add" size="24" color={isDarkMode ? "#fff" : "#333"} />
      </View>

      <Popup
        show={isDrawerShow}
        position="left"
        onClose={toggleDrawer}
        className="h-screen w-[60%]"
      >
        <View
          className={`flex flex-col h-full min-w-[200px] ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <View className="flex-1 p-4 overflow-y-auto">
            <Text
              className={`text-lg font-medium mb-4 ${
                isDarkMode ? "text-gray-300" : "text-gray-800"
              }`}
            >
              历史对话
            </Text>
            <View className="pt-3">
              {chatList.length ? (
                chatList.map((item, index) => (
                  <View
                    key={index}
                    className={`p-1 mb-3 border-b cursor-pointer relative ${
                      isDarkMode
                        ? "border-gray-700 text-gray-400"
                        : "border-gray-200 text-gray-800"
                    } ${
                      item.chat_id === chatId
                        ? isDarkMode
                          ? "bg-gray-700"
                          : "bg-gray-100"
                        : ""
                    }`}
                    onClick={() => {
                      setChatId(item.chat_id);
                      setMessages(
                        typeof item.messages === "string"
                          ? JSON.parse(item.messages)
                          : item.messages
                      );
                      setSelectedModel(item.model);
                      toggleDrawer();
                    }}
                  >
                    <View
                      className={`absolute right-1 bottom-1 rounded-full hover:bg-gray-200 ${
                        isDarkMode ? "text-red-400" : "text-red-500"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(item);
                      }}
                    >
                      <Icon name="delete" size={20} />
                    </View>
                    <View className="truncate">
                      {item.messages[0]?.content}
                    </View>
                    <View
                      className={`text-xs ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      模型：{item.model}
                    </View>
                    <View
                      className={`text-xs ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      创建时间：{item.create_time.split(" ")[0]}
                    </View>
                  </View>
                ))
              ) : (
                <p className=" text-gray-600">暂无对话记录~</p>
              )}
            </View>
          </View>
          <View
            className={`p-4 border-t ${
              isDarkMode
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            } shadow-inner`}
          >
            <View className="mb-3" onClick={handleUser}>
              {userInfo ? (
                <>
                  <Text
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    用户昵称
                  </Text>
                  <Text
                    className={`ml-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-800"
                    }`}
                  >
                    {userInfo.username || userInfo.nick_name || "未设置"}
                  </Text>
                </>
              ) : (
                <Button
                  className={`text-sm text-blue-500 ${
                    isDarkMode ? "bg-gray-700" : "bg-white"
                  }`}
                >
                  去登录
                </Button>
              )}
            </View>
            <View className="flex items-center mb-3">
              <Text
                className={`mr-2 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                夜间模式
              </Text>
              <View
                onClick={toggleTheme}
                className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                  isDarkMode ? "bg-blue-500" : "bg-gray-300"
                } relative cursor-pointer`}
              >
                <View
                  className={`absolute w-5 h-5 rounded-full bg-white transform transition-transform duration-200 ease-in-out ${
                    isDarkMode ? "translate-x-6" : "translate-x-1"
                  } top-0.5`}
                />
              </View>
            </View>
          </View>
        </View>
      </Popup>
    </View>
  );
};

export default ChatPage;
