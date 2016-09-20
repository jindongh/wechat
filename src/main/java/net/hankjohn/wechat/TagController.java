package net.hankjohn.wechat;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class TagController {

    private WechatDB db = WechatDB.getInstance();

    @RequestMapping(value = "/tag")
    public String tag(@RequestParam("picId") String picId,
            Model model) {
        WechatDB.TagItem item = db.getItem(picId);
        if (item != null) {
            model.addAttribute("picUrl", item.getPicUrl());
            model.addAttribute("url", item.getUrl());
            model.addAttribute("description", item.getDescription());
            return "tag";
        } else {
            return null;
        }
    }
}
