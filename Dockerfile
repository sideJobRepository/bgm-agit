FROM eclipse-temurin:17

WORKDIR /app

RUN mkdir -p logs

COPY bgm-agit-api/build/libs/*SNAPSHOT.jar app.jar


ENTRYPOINT ["java","-Duser.timezone=Asia/Seoul","-jar","/app/app.jar"]