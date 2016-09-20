package net.hankjohn.wechat;

import java.util.HashMap;
import java.util.Map;

import lombok.Data;

public class WechatDB {
    @Data
    public static class TagItem {
        private String picUrl;
        private String url;
        private String description;
    }
    private Map<String, TagItem> items = new HashMap<>();

    private WechatDB() {}

    private static WechatDB INSTANCE = new WechatDB();

    public static WechatDB getInstance() {
        return INSTANCE;
    }

    public TagItem getItem(String userName) {
        return items.get(userName);
    }

    public void setPicUrl(String userName, String picUrl) {
        createUserIfNotExist(userName);
        items.get(userName).setPicUrl(picUrl);
    }

    public void setUrl(String userName, String url) {
        createUserIfNotExist(userName);
        items.get(userName).setUrl(url);
    }
    public void setDescription(String userName, String description) {
        createUserIfNotExist(userName);
        items.get(userName).setDescription(description);
    }
    private void createUserIfNotExist(String userName) {
        if (!items.containsKey(userName)) {
            items.put(userName, new TagItem());
        }
    }
}
