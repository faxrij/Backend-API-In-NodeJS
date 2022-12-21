const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const todo = require("../models/toDo");

function dynamicSort(property) {
	var sortOrder = 1;
	if (property[0] === "-") {
		sortOrder = -1;
		property = property.substr(1);
	}
	return function (a, b) {
		/* next line works with strings and numbers,
		 * and you may want to customize it to your needs
		 */
		if (a["done"] == true) {
			return 1 * sortOrder;
		} else if (b["done"] == true) {
			return -1 * sortOrder;
		}
		var result =
			a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
		return result * sortOrder;
	};
}

router.get("/", (req, res, next) => {
	todo
		.find()
		.select("name description priority _id done")
		.exec()
		.then((docs) => {
			docs.sort(dynamicSort("priority"));

			res.status(200).json({
				count: docs.length,
				orders: docs.map((doc) => {
					return {
						_id: doc._id,
						name: doc.name,
						description: doc.description,
						priority: doc.priority,
						done: doc.done,
						request: {
							type: "GET",
							description: "To get more detailed info",
							url: "http://localhost:3000/todo/" + doc._id,
						},
					};
				}),
			});
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

router.post("/", (req, res, next) => {
	const order = new todo({
		_id: mongoose.Types.ObjectId(),
		name: req.body.name,
		description: req.body.description,
		priority: req.body.priority,
		done: req.body.done,
	});

	return order
		.save()
		.then((result) => {
			console.log(result);
			res.status(201).json({
				message: "Todo stored",
				createdOrder: {
					_id: result._id,
					name: result.name,
					description: result.description,
					priority: result.priority,
					done: result.done,
				},
				request: {
					type: "GET",
					description: "To get more detailed info",
					url: "http://localhost:3000/todo/" + result._id,
				},
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				error: err,
			});
		});
});

router.post("/:todoId", (req, res, next) => {
	todo
		.findById(req.params.todoId)
		.exec()
		.then((order) => {
			if (!order) {
				return res.status(404).json({
					message: "TOdo not found"
				});
			} else {
                // json = JSON.parse(order);

                return res.status(200).json({
					message: "TOdo is found",
                    changedVarible : {
                      order.done = req.body.done

                    }
				});
                
			}
		})
        .catch((err) => {
            console.log("FGELDI")

			res.status(500).json({
				error: err,
			});
		});;
});

router.get("/:todoId", (req, res, next) => {
	todo
		.findById(req.params.todoId)
		.exec()
		.then((order) => {
			if (!order) {
				return res.status(404).json({
					message: "TOdo not found",
				});
			}

			res.status(200).json({
				Todo: order,
				request: {
					type: "GET",
					url: "http://localhost:3000/todo",
				},
			});
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

router.delete("/:todoId", (req, res, next) => {
	const id = req.params.todoId;

	todo
		.deleteOne({ _id: id })
		.exec()
		.then((result) => {
			res.status(200).json({
				message: "Todo deleted",
				request: {
					type: "POST",
					description: "To create more todo",
					url: "http://localhost:3000/todo/",
				},
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				error: err,
			});
		});
});

module.exports = router;
