# Events Based Pub/Sub System for Reactive Interaction on UI Elements

This library explores the goal of creating a pub/sub events based libary which you can subscribe elements to and publish custom events from.

A great use-case for this is if you have several UI updates which need to be performed when an interaction occurs. Instead of adding multiple event listeners to the same Element, you can subscribe to a custom (or native) event and react to its dispatch.

## Example Syntax

I based this library with the intent on making it clean to read, examples of which can be found below.

```javascript
// Emit an event with data
emit("form:submit", { name: "Ooni" });

// Emit an event without data (you can pass Event properties too)
emit("form:submit", { bubbles: true });

// Global listener
listen("form:submit", (data) => {
  console.log("Name: " + data.name);
});

// same as document.getElementById('form-id')
const form = window["form-id"];

// Listen to an event dispatched by a specific element (same as form.addEventListener('submit'))
attach(form).listen("submit", (e) => {
  // Some native event.
});

// Emit a custom event to a specific element with Product data
attach(form).emit("customEvent", { product });

// Listen to a custom event dispatched by a specific element
attach(form).listen("customEvent", ({ detail: { id } }) => {
  console.log(`Submitted product with ID: ${id}`);
});

// Remove listener
const handler = (e) => {
  console.log(e);
};

// Same as form.addEventListener('submit', handler);
attach(form).listen("submit", handler);
// Same as form.removeEventListener('submit', handler);
attach(form).unlisten("submit", handler);
// Same as removing all handlers
attach(form).unlisten("submit");

// We can attach the same handler to multiple events
attach(input).listen(["keyup", "paste", "change"], (e) => {
  console.log(e);
});

// We can also listen X number of times an event is emitted
attach(button).listenOnce("click", () => {
  console.log("This will log on the first click only");
});

attach(button).listenTimes("click", 5, () => {
  console.log("This will log for the first 5 clicks");
});
```

## Demo

You can see this small "demo store" preview below which puts the library to the test.
https://stackblitz.com/edit/web-platform-tn4zhp?devToolsHeight=33&file=index.html
