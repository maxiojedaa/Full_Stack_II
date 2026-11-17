package Ms.Stock.controller;

import Ms.Stock.model.ProductoStock;
import Ms.Stock.service.ProductoStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoStockController {

    private final ProductoStockService productoStockService;

    @PutMapping("/{productoId}/stock")
    public ProductoStock actualizarStock(@PathVariable Long productoId, @RequestParam int stock) {
        return productoStockService.actualizarStock(productoId, stock);
    }

    @GetMapping("/stock-bajo")
    public List<ProductoStock> verificarStockBajo() {
        return productoStockService.verificarStockBajo();
    }
    @PostMapping
    public ProductoStock crearProducto(@RequestParam String nombre,
                                        @RequestParam int stock,
                                        @RequestParam int minStock) {
    return productoStockService.crearProducto(nombre, stock, minStock);
}
}