package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

@SpringBootApplication
@RestController
public class PruebaApplication {

	@GetMapping("/")
	public RedirectView index() {
		return new RedirectView("/home.html");
	}

	public static void main(String[] args) {
		SpringApplication.run(PruebaApplication.class, args);
	}

}
