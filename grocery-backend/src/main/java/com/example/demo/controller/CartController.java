package com.example.demo.controller;

import com.example.demo.model.GroceryItem;
import com.example.demo.model.Order;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/cart")
public class CartController {
    private static final List<GroceryItem> inventory = new ArrayList<>();
    private final List<GroceryItem> cart = new ArrayList<>();
    private final List<Order> orderHistory = new ArrayList<>();
    private Order lastOrder;

    static {
        inventory.add(new GroceryItem("Apple", 100, 0.5));
        inventory.add(new GroceryItem("Banana", 80, 0.2));
        inventory.add(new GroceryItem("Milk", 50, 1.5));
        inventory.add(new GroceryItem("Bread", 40, 2.0));
    }

    @GetMapping("/inventory")
    public List<GroceryItem> listInventory() {
        return inventory;
    }

    @PostMapping("/add")
    public String addItem(@RequestBody GroceryItem item) {
        cart.add(item);
        return "Item added to cart.";
    }

    @GetMapping
    public List<GroceryItem> viewCart() {
        return cart;
    }

    public static class CheckoutRequest {
        public String pickupOrDelivery;
    }

    @PostMapping("/checkout")
    public Order checkout(@RequestBody CheckoutRequest req) {
        double total = cart.stream().mapToDouble(i -> i.getPrice() * i.getQuantity()).sum();
        lastOrder = new Order(new ArrayList<>(cart), total, false, req != null && req.pickupOrDelivery != null ? req.pickupOrDelivery : "pickup");
        orderHistory.add(lastOrder);
        cart.clear();
        return lastOrder;
    }

    @PostMapping("/pay")
    public String pay() {
        if (lastOrder == null) {
            return "No order to pay for. Please checkout first.";
        }
        lastOrder.setPaid(true);
        return "Payment successful for order. Total paid: " + lastOrder.getTotal();
    }

    @GetMapping("/order")
    public Order viewLastOrder() {
        if (!orderHistory.isEmpty()) {
            return orderHistory.get(orderHistory.size() - 1);
        }
        return null;
    }

    @GetMapping("/history")
    public List<Order> getOrderHistory() {
        return orderHistory;
    }
}
