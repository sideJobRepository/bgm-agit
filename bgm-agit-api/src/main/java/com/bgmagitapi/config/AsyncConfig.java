package com.bgmagitapi.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@EnableAsync
@Configuration
public class AsyncConfig {
    
    @Bean(name = "bizTalkExecutor")
    public Executor bizTalkExecutor() {
        ThreadPoolTaskExecutor ex = new ThreadPoolTaskExecutor();
        ex.setCorePoolSize(2); // 기본적으로 유지할 최소한의 스레드갯수
        ex.setMaxPoolSize(10); // 요청이 많아졌을때 실행할수있는 최대 스레드의 최대개수
        ex.setQueueCapacity(100);
        ex.setThreadNamePrefix("biztalk-");
        ex.initialize();
        return ex;
    }
}
