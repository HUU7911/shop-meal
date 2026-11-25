FROM maven:3.9.12-eclipse-temurin-25 AS builder
WORKDIR /workspace
COPY . .
ARG SERVICE_PATH
RUN test -n "$SERVICE_PATH" \
    && mvn -B -ntp -f pom.xml -pl "$SERVICE_PATH" -am -DskipTests package \
    && JAR="$(find "$SERVICE_PATH/target" -maxdepth 1 -type f -name '*.jar' ! -name '*.original' | head -n 1)" \
    && test -n "$JAR" \
    && cp "$JAR" /tmp/app.jar

FROM eclipse-temurin:25-jre
WORKDIR /app
RUN useradd --system --uid 10001 --home-dir /app appuser
COPY --from=builder --chown=10001:10001 /tmp/app.jar /app/app.jar
USER 10001
EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
