package com.foo.bar.todo.models;

import java.math.BigDecimal;
import javax.json.Json;
import javax.json.JsonObject;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class User {
    
    private String name;
    private String email;

    public User(String name, String email) {
        this.name = name;
        this.email = email;
    }

    public User() {}    

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    } 
    
    public JsonObject toJson() {
        return Json.createObjectBuilder().add("name", name).add("email", email).build();
    }
}
