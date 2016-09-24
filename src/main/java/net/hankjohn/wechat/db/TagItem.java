package net.hankjohn.wechat.db;

import lombok.Data;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class TagItem {
    private final int x;
    private final int y;
    @JsonProperty("Title")
    private final String title;
    @JsonProperty("Message")
    private final String message;
    @JsonProperty("Link")
    private final String link;
}

