package com.foo.bar.todo.models;

import java.io.Serializable;
import java.util.List;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.xml.bind.annotation.XmlRootElement;
import javax.enterprise.inject.spi.CDI;
import javax.persistence.EntityManager;
import javax.persistence.Table;

@Entity 
@Table(name = "micro_task")
@XmlRootElement
public class Task implements Serializable {
    
    @Id @GeneratedValue(strategy= GenerationType.AUTO)
    private Long id;
    private Boolean done;
    private String name;
    private String userId;
    
    private static EntityManager em() {
        return CDI.current().select(EntityManager.class).get();
    }

    @Override
    public String toString() {
        return "Task{" + "done=" + done + ", name=" + name + '}';
    }
    
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }
    
    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setDone(Boolean done) {
        this.done = done;
    }

    public Boolean getDone() {
        return done;
    }

    public Task(String userId, Boolean done, String name) {
        this.done = done;
        this.name = name;
        this.userId = userId;
    }

    public Task() {
    }

    public Task save() {
        if (em().contains(this)) {
            return em().merge(this);
        } else {
            em().persist(this);
            return em().find(getClass(), id);
        }
    }

    public static int deleteAll(String userId) {
        return em().createQuery("delete from Task u where u.userId = :userId").setParameter("userId", userId).executeUpdate();
    }

    public static int deleteAllDone(String userId) {
        return em().createQuery("delete from Task u where u.done = true and u.userId = :userId").setParameter("userId", userId).executeUpdate();
    }

    public static Task findById(String userId, long id) {
        Task task = (Task) em().createQuery("select u from Task u where u.id = :id and u.userId = :userId").setParameter("userId", userId).setParameter("id", id).getSingleResult();
        return task;
    }

    public void delete(String userId) {
        em().remove(findById(userId, id));
    }

    public static List<Task> findAll(String userId) {
        return em().createQuery("select u from Task u where u.userId = :userId", Task.class).setParameter("userId", userId).getResultList();
    }

    public static List<Task> findAllDone(String userId) {
        return em().createQuery("select u from Task u where u.done = true and u.userId = :userId", Task.class).setParameter("userId", userId).getResultList();
    }

    public static List<Task> findAllToDo(String userId) {
        return em().createQuery("select u from Task u where u.done = false and u.userId = :userId", Task.class).setParameter("userId", userId).getResultList();
    }

    public static Long count(String userId) {
        Long l = Long.parseLong(em().createQuery("select count(u) from Task u where u.userId = :userId").setParameter("userId", userId).getSingleResult().toString());
        if (l == null || l < 0) {
            return 0L;
        }
        return l;
    }
}
