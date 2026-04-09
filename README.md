# BEST-family-tree

Generates and displays the family tree of a BEST family using an Excel sheet as input and a simple html page with a canvas element for rendering the tree.

## How to use

### Update Family members

To update the members represented in the tree follow these steps:

- Update the `members.xlxs` excel sheet in the `data_extraction` folder with the new members
- Run the `data_extractor.py` script in the `data_extraction` folder
- Run the command `npx webpack --config webpack.config.js` to build the js file
- Upload the updated `bundle.js` file, which is generated in the `dist` folder, to the website

### Start the a local server for testing

To run the server locally and see the results of new changes a local nodejs server can be started using the command `node .\server.js`.
The website can now be viewed in any browser under `http://localhost:3000/`.
