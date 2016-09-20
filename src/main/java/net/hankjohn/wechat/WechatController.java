package net.hankjohn.wechat;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class WechatController {
    private static final String TOKEN = "hankjin";

    private WechatMessageHandler handler = new WechatMessageHandler();

    private WechatMessageParser parser = new WechatMessageParser();

    @RequestMapping(value = "/wechat",
            method=RequestMethod.GET,
            produces = "text/plain")
    public @ResponseBody String sign(
            @RequestParam("signature") String signature,
            @RequestParam("timestamp") String timestamp,
            @RequestParam("nonce") String nonce,
            @RequestParam("echostr") String echostr) {
        if (validateAuth(timestamp, nonce, echostr)) {
            return echostr;
        } else {
            return null;
        }
    }

    @RequestMapping(value = "/wechat", method=RequestMethod.POST)
    public @ResponseBody String dispose(@RequestBody String requestBody) {
        try {
            WechatMessage message = parser.parseMessage(requestBody);
            WechatResponse response = handler.handleMessage(message);
            return parser.toXml(response);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private boolean validateAuth(String timestamp, String nonce, String echostr) {
        // build auth string
        List<String> list = new ArrayList<String>();
        list.add(timestamp);
        list.add(nonce);
        list.add(TOKEN);
        Collections.sort(list);
        String content = "";
        for (String key : list) {
            content += key;
        }
        String hash = null;
        // hash
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            byte[] b = md.digest(content.getBytes());
            StringBuffer sb = new StringBuffer();
            for (int i = 0; i < b.length; i++) {
                sb.append(Integer.toString((b[i] & 0xff) + 0x100, 16)
                        .substring(1));
            }
            hash = sb.toString();
        } catch (NoSuchAlgorithmException e) {
            return false;
        }
        return hash.equals(echostr);
    }
}
