package net.hankjohn.wechat;

public class WechatMessageHandler {

    WechatDB db = WechatDB.getInstance();

    public WechatResponse handleMessage(WechatMessage message) {
        // TODO
        WechatResponse response = new WechatResponse(message);
        if (message.getMsgType().equals(WechatMessage.TEXT)) {
            if (message.getContent().startsWith("http")) {
                db.setUrl(message.getFromUserName(), message.getContent());
            } else {
                db.setDescription(message.getFromUserName(), message.getContent());
            }
        } else if (message.getMsgType().equals(WechatMessage.IMAGE)) {
            db.setPicUrl(message.getFromUserName(), message.getContent());
        }
        return response;
    }
}
