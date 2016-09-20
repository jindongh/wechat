package net.hankjohn.wechat;

public class WechatResponse {
    private static final String BASE_URL = "http://hankjohn.net/tag/";
    private WechatMessage message;

    public WechatResponse(WechatMessage message) {
        this.message = message;
    }

    public String getUrl() {
        return BASE_URL + message.getFromUserName();
    }
    public String getPicUrl() {
        return message.getContent();
    }
    public String getMsgType() {
        return "news";
    }
    public String getTitle() {
        return "AutoTagger";
    }
    public String getDescription() {
        return "Copyleft@...";
    }
    public String getFromUserName() {
        return message.getToUserName();
    }
    public String getToUserName() {
        return message.getFromUserName();
    }
}
