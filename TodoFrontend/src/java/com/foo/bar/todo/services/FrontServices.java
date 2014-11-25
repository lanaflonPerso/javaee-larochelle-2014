package com.foo.bar.todo.services;

import com.foo.bar.todo.models.User;
import java.util.ArrayList;
import java.util.List;
import javax.ejb.Stateless;
import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonValue;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedHashMap;
import javax.ws.rs.core.MultivaluedMap;

@Stateless
@Path("front")
public class FrontServices {
    
    private final Client client = ClientBuilder.newClient();
    private static final String USERS_URL = "http://127.0.0.1:8080/BackendUsers";
    private static final String TASKS_URL = "http://127.0.0.1:8080/BackendTasks";
    
    private List<User> users() {
        List<User> users = new ArrayList<>();
        JsonArray arr = client.target(USERS_URL + "/api/users").request().get(JsonArray.class);
        for (JsonValue value : arr) {
            JsonObject obj = (JsonObject) value;
            String email = obj.getString("email");
            String name = obj.getString("name");
            users.add(new User(name, email));
        }
        return users;
    }

    @GET @Path("users")
    @Produces(MediaType.APPLICATION_JSON)
    public List<User> getAllUsers() {
        return users();
    }
 
    @GET @Path("tasks")
    @Produces(MediaType.APPLICATION_JSON)
    public JsonArray getAllTasks() {
        JsonArrayBuilder builder = Json.createArrayBuilder();
        for (User user : users()) {
            JsonArray arr = client.target(TASKS_URL + "/api/").path(user.getEmail()).path("/tasks").request().get(JsonArray.class);
            for (JsonValue value : arr) {
                builder = builder.add(value);
            }
        }
        return builder.build();
    }
    
    @Path("tasks/done") @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    public void deleteAllDoneTasks() {
        for (User user : users()) {
            client.target(TASKS_URL + "/api/").path(user.getEmail()).path("/tasks/done").request().delete();
        }
    }
    
    @Path("tasks/{id}") @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public JsonObject changeTaskState(@PathParam("id") Long id, @FormParam("userId") String userId, @FormParam("done") Boolean done) {
        System.out.println("dsfq");
        MultivaluedMap<String, String> formData = new MultivaluedHashMap<>();
        formData.add("done", done.toString());
        return client.target(TASKS_URL + "/api/").path(userId).path("/tasks/").path(id.toString()).request().put(Entity.form(formData), JsonObject.class);
    }
    
    @POST @Path("tasks")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public JsonObject createTask(@FormParam("userId") String userId, @FormParam("name") String name) {
        MultivaluedMap<String, String> formData = new MultivaluedHashMap<>();
        formData.putSingle("name", name);
        return client.target(TASKS_URL + "/api/").path(userId).path("/tasks").request().post(Entity.form(formData), JsonObject.class);
    }
    
    @Path("tasks/{id}") @GET
    @Produces(MediaType.APPLICATION_JSON)
    public JsonObject getTask(@PathParam("id") Long id, @QueryParam("userId") String userId) {
        return client.target(TASKS_URL + "/api/").path(userId).path("/tasks/").path(id.toString()).request().get(JsonObject.class);
    }
    
    @Path("tasks/{id}") @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    public void deleteTask(@PathParam("id") Long id, @QueryParam("userId") String userId) {
        client.target(TASKS_URL + "/api/").path(userId).path("/tasks/").path(id.toString()).request().delete();
    }
    
    @DELETE @Path("tasks")
    @Produces(MediaType.APPLICATION_JSON)
    public void deleteAllTasks() {
        for (User user : users()) {
            client.target(TASKS_URL + "/api/").path(user.getEmail()).path("/tasks").request().delete();
        }
    }
}
