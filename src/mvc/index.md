In the [Event-Driven Architecture Tutorial](../eventarch/) I showed how to build interactive web applications using event listener functions that modify the application's state and re-render that state to the page. That was a simple form of a much more pervasive and powerful architectural pattern known as Model-View-Controller (MVC). Most JavaScript application frameworks are based on some variation of the MVC pattern, so before we dive into learning React, we should try to understand the MVC pattern in general.

MVC was developed in the early days of personal desktop computers, graphical user interfaces (GUIs), and object-oriented programming (OOP). These new platforms enabled new kinds of interactive graphical applications that required new approaches to code architecture. It was not at all immediately obvious how one should architect something as complex as a spreadsheet or word processing application. Developers experimented with many options before eventually settling on the MVC pattern. It worked so well that it became the standard architecture for GUI applications. Once JavaScript and the DOM matured, the MVC pattern was applied to client-side web applications, resulting in several competing libraries/frameworks (e.g., React, Angular, Vue, etc.).

To understand MVC, let's look at each of the concepts in turn, and see how they are applied in a simple JavaScript application.

## Models

The **Model** part of Model-View-Controller refers to a data object that is being manipulated by the application. A model is simply an instance of a class (in the OOP sense) that is responsible for managing some chunk of data. It ensures that the data is created and modified correctly according to the rules of the application. In many MVC variants, the model is also responsible to raising events when the data inside the model changes.

Note that models only care about the data they manage. Models do not render that data to the screen, nor do they handle saving that data to some kind of persistent data store. Their only concern is managing their data and enforcing the application's rules regarding changes to those data. Models are the most narcissistic of objects: they only know and care about about themselves.

For example, if we were to build a simple task list application using the MVC architecture, we would define two models: `Task` and `TaskList`. The `Task` model would manage the data for a specific task and enforce rules (e.g., the task title must be non-blank). The `TaskList` would manage the overall list of tasks. Both models would also allow callers to add event listener functions that will be called whenever the data inside the model changes, similar to how the DOM allows us to add an event listener function that is called when users click on elements or press keys on the keyboard.

## Views

A **view** is an object that is responsible for rendering a model to an output device (typically the screen, but perhaps a printer). The view doesn't manage the data: that's the model's job. The view just reads the data from the model and renders it to the output device. It also listens for change events raised by the model and automatically re-renders itself whenever the model changes.

How the view renders the model is up to the view. For example, a `TaskListView` might render a `TaskList` model as a simple bulleted list, but a `TaskCalendarView` might render the `TaskList` as a set of events on a calendar, and a `TaskSummaryView` might render some summary statistics like the number of completed and uncompleted tasks. All of those views could render the same `TaskList` in different ways, and all of them could render to the screen at the same time. Since they are rendering the same model, any changes to that model would cause all views to automatically re-render so that they always show the correct up-to-date data.

## Controllers

A **controller** is an object that is responsible for loading/saving models from/to persistent storage, and connecting those models to views. In the original MVC architecture, the controller was also the component responsible for handling user events and updating the models in response. In more recent variations of MVC, the views assume that responsibility, as they are the ones creating the on-screen elements, and are thus better equipped to handle the events raised by those elements. In this newer style, views know about models, but they do not know anything about the controllers that connect them to those models.

The following illustrates these relationships:

![mvc architectural diagram](img/mvc.png)

## MVC in JavaScript

Let's see how this architecture would be applied to a web application written in JavaScript.

### Models


