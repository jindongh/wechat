package net.hankjohn.wechat.db;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

import lombok.Data;

public class WechatDB {
    private Map<String, ImageItem> images = new HashMap<>();

    private Map<String, List<TagItem>> tags = new HashMap<>();

    private WechatDB() {
        // Fake data
        images.put("test", new ImageItem("test.png"));
        tags.put("test", Arrays.asList(
                    new TagItem(50, 50, "Title", "Message", "http://itag.com/image/1"),
                    new TagItem(100, 100, "Title2", "Message2", "http://itag.com/image/2")
                    ));
    }

    private static WechatDB INSTANCE = new WechatDB();

    public static WechatDB getInstance() {
        return INSTANCE;
    }

    public ImageItem getImage(String imageId) {
        return images.get(imageId);
    }

    public void addImage(String imageId, String imageUrl) {
        images.put(imageId, new ImageItem(imageUrl));
    }

    public void setTags(String imageId, List<TagItem> tagList) {
        tags.put(imageId, tagList);
    }

    public void addTag(String imageId,
            int x,
            int y,
            String title,
            String message,
            String link) {
        if (!tags.containsKey(imageId)) {
            tags.put(imageId, new ArrayList<TagItem>());
        }
        removeTag(imageId, x, y);
        tags.get(imageId).add(new TagItem(x, y, title, message, link));
    }

    public void removeTag(String imageId,
            int x,
            int y) {
        if (!tags.containsKey(imageId)) {
            return ;
        }
        for (TagItem item : tags.get(imageId)) {
            if (item.getX()==x && item.getY()==y) {
                tags.remove(item);
            }
        }
    }

    public List<TagItem> listTags(String imageId) {
        return tags.get(imageId);
    }

    public void setTagTitle(String imageId, String title) {
        addTag(imageId, 0, 0, title, "TODO", "TODO");
    }

    public void setTagMessage(String imageId, String message) {
        addTag(imageId, 0, 0, "TODO", message, "TODO");
    }
}
