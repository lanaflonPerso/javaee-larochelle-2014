package com.foo.bar.todo.models;

import java.io.Serializable;
import java.util.List;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.xml.bind.annotation.XmlRootElement;
import javax.enterprise.inject.spi.CDI;
import javax.persistence.EntityManager;

@Entity @XmlRootElement
public class TodoUser implements Serializable {
    
    private String name;
    @Id private String email;
    
    private static EntityManager em() {
        return CDI.current().select(EntityManager.class).get();
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public TodoUser(String name, String email) {
        this.name = name;
        this.email = email;
    }

    public TodoUser() {
    }
    
    public TodoUser save() {
        if (em().contains(this)) {
            return em().merge(this);
        } else {
            em().persist(this);
            return em().find(getClass(), email);
        }
    }

    public static int deleteAll() {
        return em().createQuery("delete from TodoUser").executeUpdate();
    }

    public static TodoUser findByEmail(String email) {
        TodoUser task = (TodoUser) em().createQuery("select u from TodoUser u where u.email = :email").setParameter("email", email).getSingleResult();
        return task;
    }
    
    public static TodoUser findByName(String name) {
        TodoUser task = (TodoUser) em().createQuery("select u from TodoUser u where u.name = :name").setParameter("name", name).getSingleResult();
        return task;
    }

    public void delete() {
        em().remove(findByEmail(email));
    }

    public static List<TodoUser> findAll() {
        return em().createQuery("select u from TodoUser u", TodoUser.class).getResultList();
    }

    public static Long count(String userId) {
        Long l = Long.parseLong(em().createQuery("select count(u) from TodoUser u").getSingleResult().toString());
        if (l == null || l < 0) {
            return 0L;
        }
        return l;
    }
}
