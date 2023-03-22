  <h1>NixFlix</h1>
    <p>
      This is my README file to give you instructions in how to
      use this API. Hear we have the requirements for this API to work:
    </p>
    <h3>App Dependencies</h3>
    <ul>
      <li>Express</li>
      <li>Body-Parser</li>
      <li>Lodash</li>
      <li>Method-override</li>
      <li>Morgan</li>
      <li>UUID</li>
    </ul>
    <h3>Technical Requirements</h3>
    <ul>
      <li>The API must be a Node.js and Express application.</li>
      <li>
        The API must use REST architecture, with URL endpoints corresponding to
        the data operations listed above
      </li>
      <li>
        The API must use at least three middleware modules, such as the
        body-parser package for reading data from requests and morgan for
        logging.
      </li>
      <li>The API must use a “package.json” file.</li>
      <li>The database must be built using MongoDB.</li>
      <li>The business logic must be modeled with Mongoose.</li>
      <li>The API must provide movie information in JSON format.</li>
      <li>The JavaScript code must be error-free.</li>
      <li>The API must be tested in Postman.</li>
      <li>The API must include user authentication and authorization code.</li>
      <li>The API must include data validation logic.</li>
      <li>The API must meet data security regulations.</li>
      <li>
        The API source code must be deployed to a publicly accessible platform
        like GitHub.
      </li>
      <li>The API must be deployed to Heroku.</li>
    </ul>
   <table>
      <thead>
        <tr>
          <th>Endpoint</th>
          <th>Method</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>/</td>
          <td>GET</td>
          <td>Serves the index.html file</td>
        </tr>
        <tr>
          <td>/movies</td>
          <td>GET</td>
          <td>Returns a list of all movies</td>
        </tr>
        <tr>
          <td>/genres</td>
          <td>GET</td>
          <td>Returns a list of all genres</td>
        </tr>
        <tr>
          <td>/directors</td>
          <td>GET</td>
          <td>Returns a list of all directors</td>
        </tr>
        <tr>
          <td>/movies/:Director</td>
          <td>GET</td>
          <td>
            Returns data about a director, including matching movies, by name
          </td>
        </tr>
        <tr>
          <td>/movies/:Title</td>
          <td>GET</td>
          <td>Returns data about a single movie by title</td>
        </tr>
        <tr>
          <td>/directors/:Name</td>
          <td>GET</td>
          <td>
            Returns data about a director, including matching movies, by name
          </td>
        </tr>
        <tr>
          <td>/genres/:Name</td>
          <td>GET</td>
          <td>
            Returns data about a genre, including matching movies, by name
          </td>
        </tr>
        <tr>
          <td>/users</td>
          <td>GET</td>
          <td>Returns a list of all users</td>
        </tr>
        <tr>
          <td>/users/:Username</td>
          <td>GET</td>
          <td>Returns a user by username</td>
        </tr>
      </tbody>
    </table>
