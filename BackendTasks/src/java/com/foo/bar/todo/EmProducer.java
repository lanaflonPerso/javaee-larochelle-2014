package com.foo.bar.todo;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.inject.Produces;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

@ApplicationScoped
public class EmProducer {

    @PersistenceContext @Produces
    private EntityManager em;
}
