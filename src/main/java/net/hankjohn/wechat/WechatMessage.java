package net.hankjohn.wechat;

import lombok.Getter;
import org.dom4j.Element;

public class WechatMessage {
    public static final String VIDEO = "video";
    public static final String VOICE = "voice";
    public static final String MUSIC = "music";
    public static final String THUMB = "link";
    public static final String IMAGE = "image";
    public static final String TEXT = "text";

    @Getter
    private String msgType;
    @Getter
    private String content;
    @Getter
    private String fromUserName;
    @Getter
    private String toUserName;

    public WechatMessage(String type, String content, Element ele) {
        this.msgType = type;
        this.content = content;
        this.fromUserName = ele.element("FromUserName").getStringValue();
        this.toUserName = ele.element("ToUserName").getStringValue();
    }
}
