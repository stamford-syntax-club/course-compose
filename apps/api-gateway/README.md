# SGate - A Custom Made API Gateway by Chinathai

SGate is designed to efficiently proxy traffic to corresponding CourseCompose
Services. This gateway simplifies the management and routing of API requests,
allowing for a streamlined communication process between clients and various
services.

## Configuration

By default, SGate reads its configurations from a file called
`syntax-config.yaml`. The configuration follows a YAML syntax and includes
information about the routes, methods, and corresponding destination services.
Below is an example of the configuration structure:

```yaml
routes:
    - path: /api/courses
      method: GET
      destination:
          service: list_all_courses
          endpoint: https://center-be.stamford.dev/api/resources/resources #this is just a temporary url
          is_array: true

    - path: /api/courses/:courseCode
      method: GET
      destination:
          service: get_course_info
          endpoint: http://localhost:8002/courses/:courseCode

    - path: /api/courses/:courseCode/reviews
      method: GET
      destination:
          service: get_course_reviews
          endpoint: http://localhost:8003/api/courses/:courseCode/reviews
          is_array: true
```

| Field                  | Data Type | Description                                                                                                                                                                   |
| ---------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `routes`               | array     | An array that contains individual route configurations, each defining how a specific API endpoint should be handled.                                                          |
| `path`                 | string    | The URL path pattern that the API Gateway should match for the incoming request. It supports variables denoted by `:variableName` (e.g., `/api/courses/:courseCode`).         |
| `method`               | string    | The HTTP method (e.g., GET, POST, PUT, DELETE) for which the route is defined.                                                                                                |
| `destination`          | object    | An object specifying the details of the destination service where the API request should be forwarded. It includes the `service`, `endpoint`, and optional `is_array` fields. |
| `destination.service`  | string    | (Optional) A unique identifier or name for the destination service. This is only used for logging purposes                                                                    |
| `destination.endpoint` | string    | The URL of the destination service's API endpoint.                                                                                                                            |
| `destination.is_array` | boolean   | (Optional) A boolean indicating whether the response from the destination service is expected to be an array (`true`) or a single object (`false`). Defaults to `false`.      |

## Usage

### Local Development

To run SGate locally, simply type

```sh
pnpm run dev
```

A development configuration file (`gateway-dev.yaml`) will be used
automatically, feel free to make any changes necessary

### Deploy with docker

To deploy SGate in docker, make sure to mount the the configuration file as
follows:

```yaml
api-gateway:
    image: api-gateway:test
    volumes:
        - ./<config-file>:/app/syntax-config.yaml
    ports:
        - 8000:8000
```
