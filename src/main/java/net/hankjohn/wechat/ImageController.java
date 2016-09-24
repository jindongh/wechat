package net.hankjohn.wechat;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMethod;

import net.hankjohn.wechat.db.ImageItem;
import net.hankjohn.wechat.db.WechatDB;

@Controller
public class ImageController {

    private WechatDB db = WechatDB.getInstance();

    @RequestMapping(value = "/image")
    public String tag(@RequestParam("imageId") String imageId,
            Model model) {
        ImageItem image = db.getImage(imageId);
        if (image != null) {
            model.addAttribute("imageId", imageId);
            model.addAttribute("imageUrl", image.getImageUrl());
            return "image";
        } else {
            return null;
        }
    }
}
