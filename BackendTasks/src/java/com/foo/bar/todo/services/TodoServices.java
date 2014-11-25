package com.foo.bar.todo.services;

import com.foo.bar.todo.models.Task;
import java.util.Collections;
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
@Path("{userId}/tasks")
public class TodoServices {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<Task> allTasks(@PathParam("userId") String userId) {
        List<Task> tasks = Task.findAll(userId);
        if (tasks == null) {
            return Collections.emptyList();
        }
        return tasks;
    }
    
    @Path("done") @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    public void deleteAllDone(@PathParam("userId") String userId) {
        Task.deleteAllDone(userId);
    }
    
    @Path("{id}") @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Task changeTaskState(@PathParam("userId") String userId, @PathParam("id") Long id, @FormParam("done") Boolean done) {
        Task task = Task.findById(userId, id);
        task.setDone(done);
        return task.save();
    }
    
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Task createTask(@PathParam("userId") String userId, @FormParam("name") String name) {
        return new Task(userId, false, name).save();
    }
    
    @Path("{id}") @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Task getTask(@PathParam("userId") String userId, @PathParam("id") Long id) {
        Task task = Task.findById(userId, id);
        if (task == null) {
            throw new NotFoundException("Entity with id " + id + " not found.");
        }
        return task;
    }
    
    @Path("{id}") @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    public void deleteTask(@PathParam("userId") String userId, @PathParam("id") Long id) {
        Task.findById(userId, id).delete(userId);
    }
    
    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    public void deleteAll(@PathParam("userId") String userId) {
        Task.deleteAll(userId);
    }
}
