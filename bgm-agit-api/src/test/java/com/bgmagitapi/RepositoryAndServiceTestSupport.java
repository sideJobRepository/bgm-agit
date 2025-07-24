package com.bgmagitapi;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public abstract class RepositoryAndServiceTestSupport {
    @Autowired
    protected ObjectMapper objectMapper;
}
