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

@Entity @XmlRootElement
public class Task implements Serializable {
    
    @Id @GeneratedValue(strategy= GenerationType.AUTO)
    private Long id;
    private Boolean done;
    private String name;
    
    private static EntityManager em() {
        return CDI.current().select(EntityManager.class).get();
    }

    @Override
    public String toString() {
        return "Task{" + "done=" + done + ", name=" + name + '}';
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

    public Task(Boolean done, String name) {
        this.done = done;
        this.name = name;
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

    public static int deleteAll() {
        return em().createQuery("delete from Task").executeUpdate();
    }

    public static int deleteAllDone() {
        return em().createQuery("delete from Task u where u.done = true").executeUpdate();
    }

    public static Task findById(long id) {
        return em().find(Task.class, id);
    }

    public void delete() {
        em().remove(findById(id));
    }

    public static List<Task> findAll() {
        return em().createQuery("select u from Task u", Task.class).getResultList();
    }

    public static List<Task> findAllDone() {
        return em().createQuery("select u from Task u where u.done = true", Task.class).getResultList();
    }

    public static List<Task> findAllToDo() {
        return em().createQuery("select u from Task u where u.done = false", Task.class).getResultList();
    }

    public static Long count() {
        Long l = Long.parseLong(em().createQuery("select count(u) from Task u").getSingleResult().toString());
        if (l == null || l < 0) {
            return 0L;
        }
        return l;
    }
}
