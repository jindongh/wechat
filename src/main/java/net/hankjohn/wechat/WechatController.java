package net.hankjohn.wechat;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class WechatController {

    @RequestMapping(value = "/wechat", method=RequestMethod.GET)
    public String sign(@RequestParam(value="name", required=false, defaultValue="World") String name, Model model) {
        model.addAttribute("name", name);
        return "wechat";
    }

    @RequestMapping(value = "/wechat", method=RequestMethod.POST)
    public String dispose(@RequestParam(value="name", required=false, defaultValue="World") String name, Model model) {
        return "wechat";
    }

}
