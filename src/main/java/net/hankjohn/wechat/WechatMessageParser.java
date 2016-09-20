package net.hankjohn.wechat;

import java.util.Date;

import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;

public class WechatMessageParser {
    public WechatMessage parseMessage(String xml) throws Exception {
        Element ele = DocumentHelper.parseText(xml).getRootElement();
        String msgType = ele.elementText("MsgType");
        String content = null;
        switch (msgType) {
            case WechatMessage.TEXT:
                content = ele.element("Content").getStringValue();
                break;
            case WechatMessage.IMAGE:
                content = ele.element("PicUrl").getStringValue();
                break;
        }
        return new WechatMessage(msgType, content, ele);
    }

    public String toXml(WechatResponse resp) {
        Element ele = DocumentHelper.createElement("xml");
        ele.addElement("ToUserName").addCDATA(resp.getToUserName());
        ele.addElement("FromUserName").addCDATA(resp.getFromUserName());
        Long currentTime = Long.valueOf(new Date().getTime() / 1000);
        String createTime = String.valueOf(currentTime);
        ele.addElement("CreateTime").setText(createTime);
        ele.addElement("MsgType").addCDATA(resp.getMsgType());
        ele.addElement("ArticleCount").addText("1");
        Element articlesEle = ele.addElement("Articles");
        Element itemEle = articlesEle.addElement("item");
        itemEle.addElement("Title").addCDATA(resp.getTitle());
        itemEle.addElement("Description").addCDATA(resp.getDescription());
        itemEle.addElement("PicUrl").addCDATA(resp.getPicUrl());
        itemEle.addElement("Url").addCDATA(resp.getUrl());
        return ele.asXML();
    }
}
