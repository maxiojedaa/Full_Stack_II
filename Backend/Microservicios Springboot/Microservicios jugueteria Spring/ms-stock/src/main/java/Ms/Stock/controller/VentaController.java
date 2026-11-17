package Ms.Stock.controller;

import Ms.Stock.model.Venta;
import Ms.Stock.service.VentaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaService ventaService;

    @PostMapping
    public Venta registrarVenta(@RequestParam Long productoId, @RequestParam int cantidad) {
        return ventaService.registrarVenta(productoId, cantidad);
    }
}