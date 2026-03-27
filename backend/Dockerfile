# # Use Java 17
# FROM eclipse-temurin:17-jdk-alpine

# # Set working directory
# WORKDIR /app

# # Copy project files
# COPY . .

# RUN chmod +x mvnw

# # Build the app
# RUN ./mvnw clean package -DskipTests

# # Run the jar
# CMD ["java", "-jar", "target/*.jar"]


FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY . .

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# Debug (optional)
RUN ls -la target

CMD sh -c "java -jar target/*.jar"