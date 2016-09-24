package net.hankjohn.wechat;

import net.hankjohn.wechat.db.WechatDB;

public class WechatMessageHandler {

    WechatDB db = WechatDB.getInstance();

    public WechatResponse handleMessage(WechatMessage message) {
        // TODO
        WechatResponse response = new WechatResponse(message);
        if (message.getMsgType().equals(WechatMessage.TEXT)) {
            if (message.getContent().startsWith("http")) {
                db.setTagMessage(message.getFromUserName(), message.getContent());
            } else {
                db.setTagTitle(message.getFromUserName(), message.getContent());
            }
        } else if (message.getMsgType().equals(WechatMessage.IMAGE)) {
            db.addImage(message.getFromUserName(), message.getContent());
        }
        return response;
    }
}
