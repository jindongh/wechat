package net.hankjohn.wechat;

public class WechatResponse {
    private static final String BASE_URL = "http://hankjohn.net/tag?picId=";
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
        return "iTag";
    }
    public String getDescription() {
        WechatDB.TagItem item = WechatDB.getInstance().getItem(getToUserName());
        if (item != null && item.getDescription() != null) {
            return item.getDescription();
        } else {
            return "Please send link and description. Copyleft@AI-Tag.com";
        }
    }
    public String getFromUserName() {
        return message.getToUserName();
    }
    public String getToUserName() {
        return message.getFromUserName();
    }
}
