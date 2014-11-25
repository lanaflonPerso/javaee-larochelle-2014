package com.foo.bar.todo.services;

import com.foo.bar.todo.models.TodoUser;
import java.util.List;
import javax.ejb.Stateless;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

@Stateless
@Path("users")
public class UserServices {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<TodoUser> allUsers() {
        return TodoUser.findAll();
    }
    
    @Path("{id}") @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public TodoUser update(TodoUser user) {
        TodoUser u = TodoUser.findByEmail(user.getEmail());
        u.setName(user.getName());
        return u.save();
    }
    
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public TodoUser createTask(TodoUser user) {
        return user.save();
    }
    
    @Path("{id}") @GET
    @Produces(MediaType.APPLICATION_JSON)
    public TodoUser getTask(@QueryParam("email") String email) {
        TodoUser user = TodoUser.findByEmail(email);
        if (user == null) {
            throw new NotFoundException("Entity with id " + email + " not found.");
        }
        return user;
    }
    
    @Path("{id}") @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    public void delete(@QueryParam("email") String email) {
        TodoUser.findByEmail(email).delete();
    }
    
    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    public void deleteAll() {
        TodoUser.deleteAll();
    }
}
