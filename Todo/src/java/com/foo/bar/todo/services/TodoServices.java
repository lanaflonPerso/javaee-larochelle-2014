package com.foo.bar.todo.services;

import com.foo.bar.todo.models.Task;
import java.util.List;
import javax.ejb.Stateless;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Stateless
@Path("tasks")
public class TodoServices {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<Task> allTasks() {
        return Task.findAll();
    }
    
    @Path("done") @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    public void deleteAllDone() {
        Task.deleteAllDone();
    }
    
    @Path("{id}") @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Task changeTaskState(@PathParam("id") Long id, @FormParam("done") Boolean done) {
        Task task = Task.findById(id);
        task.setDone(done);
        return task.save();
    }
    
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Task createTask(@FormParam("name") String name) {
        return new Task(false, name).save();
    }
    
    @Path("{id}") @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Task getTask(@PathParam("id") Long id) {
        Task task = Task.findById(id);
        if (task == null) {
            throw new NotFoundException("Entity with id " + id + " not found.");
        }
        return task;
    }
    
    @Path("{id}") @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    public void deleteTask(@PathParam("id") Long id) {
        Task.findById(id).delete();
    }
    
    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    public void deleteAll() {
        Task.deleteAll();
    }
}
