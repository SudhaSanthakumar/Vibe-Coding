package com.example.demo.model;

import java.util.List;

public class Order {
    private List<GroceryItem> items;
    private double total;
    private boolean paid;

    public Order() {}

    public Order(List<GroceryItem> items, double total, boolean paid) {
        this.items = items;
        this.total = total;
        this.paid = paid;
    }

    public List<GroceryItem> getItems() { return items; }
    public void setItems(List<GroceryItem> items) { this.items = items; }
    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }
    public boolean isPaid() { return paid; }
    public void setPaid(boolean paid) { this.paid = paid; }
}
