package com.example.demo.model;

import java.util.List;

public class Order {
    private String orderId;
    private List<GroceryItem> items;
    private double total;
    private boolean paid;
    private String pickupOrDelivery; // "pickup" or "delivery"

    public Order() {
        this.orderId = java.util.UUID.randomUUID().toString();
    }

    public Order(List<GroceryItem> items, double total, boolean paid, String pickupOrDelivery) {
        this.orderId = java.util.UUID.randomUUID().toString();
        this.items = items;
        this.total = total;
        this.paid = paid;
        this.pickupOrDelivery = pickupOrDelivery;
    }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public List<GroceryItem> getItems() { return items; }
    public void setItems(List<GroceryItem> items) { this.items = items; }
    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }
    public boolean isPaid() { return paid; }
    public void setPaid(boolean paid) { this.paid = paid; }
    public String getPickupOrDelivery() { return pickupOrDelivery; }
    public void setPickupOrDelivery(String pickupOrDelivery) { this.pickupOrDelivery = pickupOrDelivery; }
}
