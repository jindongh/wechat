package net.hankjohn.wechat;

import java.util.List;
import java.util.ArrayList;

import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.TypeFactory;

import net.hankjohn.wechat.db.TagItem;
import net.hankjohn.wechat.db.WechatDB;

@RestController
public class TagController {
    private static final String MODE_RETRIEVE = "Retrieve";
    private static final String MODE_STORE = "Store";

    private ObjectMapper objectMapper = new ObjectMapper();
    private TypeFactory typeFactory = objectMapper.getTypeFactory();


    private WechatDB db = WechatDB.getInstance();

    @RequestMapping(value = "/tags/{imageId}")
    public List<TagItem> tags(
            @PathVariable String imageId,
            @RequestParam(value="HotspotPlugin_data", required=false) String data,
            @RequestParam("HotspotPlugin_mode") String mode) throws Exception {
        if (mode.equals(MODE_STORE)) {
            List<TagItem> tagList = new ArrayList<>();
            if (!data.isEmpty()) {
                tagList = objectMapper.readValue(data,
                        typeFactory.constructCollectionType(List.class, TagItem.class));
            }
            db.setTags(imageId, tagList);
            System.out.println("Set to " + tagList.size());
            return new ArrayList<TagItem>();
        } else {
            List<TagItem> tagList = db.listTags(imageId);
            System.out.println("Get num " + tagList.size());
            return tagList;
        }
    }

    @RequestMapping(value="/tag")
    public void tag(@RequestParam("imageId") String imageId,
            @RequestParam("x") int x,
            @RequestParam("y") int y,
            @RequestParam("title") String title,
            @RequestParam("message") String message) {
        db.addTag(imageId,
                x,
                y,
                title,
                message);
    }
}
